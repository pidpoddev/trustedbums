import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const dmarcReportsSource = readFileSync("supabase/functions/dmarc-reports/index.ts", "utf8");

describe("DMARC report parser contracts", () => {
  it("handles gzip attachments before zip attachments", () => {
    const extractXmlDocuments = dmarcReportsSource.match(/function extractXmlDocuments[\s\S]*?\n}\n\nfunction parseDmarcXml/)?.[0] ?? "";
    const gzipBranchIndex = extractXmlDocuments.indexOf("gunzipSync(bytes)");
    const zipBranchIndex = extractXmlDocuments.indexOf("unzipSync(bytes)");

    expect(gzipBranchIndex).toBeGreaterThan(-1);
    expect(zipBranchIndex).toBeGreaterThan(-1);
    expect(gzipBranchIndex).toBeLessThan(zipBranchIndex);
    expect(extractXmlDocuments).toContain("(?:^|\\/)(?:x-)?gzip$");
    expect(extractXmlDocuments).toContain("(?:^|\\/)(?:x-)?zip(?:$|[+;-])");
    expect(extractXmlDocuments).not.toContain("/zip/i.test(attachment.contentType");
  });
});
