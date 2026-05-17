export type CsvRow = Record<string, string>;

function normalizeNewlines(input: string) {
  return input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

export function parseCsv(input: string) {
  const text = normalizeNewlines(input);
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === "\"") {
      if (insideQuotes && nextChar === "\"") {
        currentValue += "\"";
        index += 1;
        continue;
      }

      insideQuotes = !insideQuotes;
      continue;
    }

    if (!insideQuotes && char === ",") {
      currentRow.push(currentValue);
      currentValue = "";
      continue;
    }

    if (!insideQuotes && char === "\n") {
      currentRow.push(currentValue);
      rows.push(currentRow);
      currentRow = [];
      currentValue = "";
      continue;
    }

    currentValue += char;
  }

  if (currentValue.length || currentRow.length) {
    currentRow.push(currentValue);
    rows.push(currentRow);
  }

  if (!rows.length) {
    return [];
  }

  const headers = rows[0].map((header) => header.trim());

  return rows
    .slice(1)
    .filter((row) => row.some((value) => value.trim()))
    .map<CsvRow>((row) =>
      headers.reduce<CsvRow>((record, header, index) => {
        record[header] = row[index]?.trim() ?? "";
        return record;
      }, {}),
    );
}
