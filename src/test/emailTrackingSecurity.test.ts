import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const emailTrackSource = readFileSync("supabase/functions/email-track/index.ts", "utf8");

describe("email tracking security", () => {
  it("does not redirect invalid delivery ids or arbitrary destinations", () => {
    expect(emailTrackSource).toContain("EMAIL_TRACKING_ALLOWED_HOSTS");
    expect(emailTrackSource).toContain("getApprovedClickUrl");
    expect(emailTrackSource).toContain('parsed.protocol !== "https:"');
    expect(emailTrackSource).toContain("allowedClickHosts.has");
  });

  it("requires a recorded delivery before redirecting a click", () => {
    const clickHandlerBody = emailTrackSource.match(/if \(url\.pathname\.endsWith\("\/click"\)\) \{[\s\S]*?return Response\.redirect\(targetUrl, 302\);/)?.[0] ?? "";

    expect(clickHandlerBody).toContain("const targetUrl = getApprovedClickUrl");
    expect(clickHandlerBody).toContain("const recorded = await recordEvent");
    expect(clickHandlerBody).toContain("if (!recorded)");
    expect(clickHandlerBody.indexOf("getApprovedClickUrl")).toBeLessThan(clickHandlerBody.indexOf("recordEvent"));
    expect(clickHandlerBody.indexOf("if (!recorded)")).toBeLessThan(clickHandlerBody.indexOf("return Response.redirect"));
  });
});
