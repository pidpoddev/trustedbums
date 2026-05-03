import type { TermsVersion } from "@/lib/portalApi";

function normalizePdfText(value: string) {
  return value
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .split("")
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || (code >= 32 && code <= 126);
    })
    .join("");
}

function escapePdfText(value: string) {
  return normalizePdfText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrapLine(line: string, maxLength = 92) {
  const words = normalizePdfText(line).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) {
    lines.push(current);
  }

  return lines.length ? lines : [""];
}

function paginate(lines: string[], linesPerPage = 42) {
  const pages: string[][] = [];
  for (let index = 0; index < lines.length; index += linesPerPage) {
    pages.push(lines.slice(index, index + linesPerPage));
  }
  return pages;
}

export function createPartnerTermsPdfBlob(terms: TermsVersion) {
  const sourceLines = [
    terms.title,
    `Version ${terms.version}`,
    "",
    terms.body,
    "",
    "Client Agreement FAQ",
    "",
    terms.faq_body ?? "",
  ];
  const wrappedLines = sourceLines.flatMap((block) =>
    block.split("\n").flatMap((line) => (line.trim() ? wrapLine(line) : [""])),
  );
  const pages = paginate(wrappedLines);
  const objects: string[] = [];
  const pageObjectIds: number[] = [];
  const fontObjectId = 3;

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = "";
  objects[fontObjectId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  pages.forEach((pageLines, pageIndex) => {
    const contentObjectId = 4 + pageIndex * 2;
    const pageObjectId = contentObjectId + 1;
    pageObjectIds.push(pageObjectId);

    const textCommands = pageLines
      .map((line, lineIndex) => {
        const y = 760 - lineIndex * 17;
        return `BT /F1 10 Tf 54 ${y} Td (${escapePdfText(line)}) Tj ET`;
      })
      .join("\n");

    objects[contentObjectId] = `<< /Length ${textCommands.length} >>\nstream\n${textCommands}\nendstream`;
    objects[pageObjectId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> /Contents ${contentObjectId} 0 R >>`;
  });

  objects[2] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = pdf.length;
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id += 1) {
    pdf += `${offsets[id].toString().padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

export function downloadPartnerTermsPdf(terms: TermsVersion) {
  const blob = createPartnerTermsPdfBlob(terms);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `trusted-bums-partner-terms-${terms.version}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
}
