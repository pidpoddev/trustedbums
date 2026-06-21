import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sendWebsiteEmailSource = readFileSync("supabase/functions/send-website-email/index.ts", "utf8");
const submitContactSource = readFileSync("supabase/functions/submit-contact/index.ts", "utf8");

describe("website email function boundary", () => {
  it("requires trusted server-side caller proof before parsing templates", () => {
    const requestHandlerBody = sendWebsiteEmailSource.match(/Deno\.serve\(async \(request\) => \{[\s\S]*?\n\}\);/)?.[0] ?? "";
    const trustCheckIndex = requestHandlerBody.indexOf("isTrustedCaller(request)");
    const templateCheckIndex = requestHandlerBody.indexOf('input.template !== "contact-submission"');

    expect(sendWebsiteEmailSource).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(sendWebsiteEmailSource).toContain("WEBSITE_EMAIL_INTERNAL_SECRET");
    expect(sendWebsiteEmailSource).toContain("getBearerToken(request)");
    expect(sendWebsiteEmailSource).toContain("isTrustedCaller(request)");
    expect(trustCheckIndex).toBeGreaterThan(-1);
    expect(templateCheckIndex).toBeGreaterThan(-1);
    expect(trustCheckIndex).toBeLessThan(templateCheckIndex);
  });

  it("keeps browser callers from using wildcard CORS while submit-contact remains the public intake", () => {
    expect(sendWebsiteEmailSource).not.toContain('"Access-Control-Allow-Origin": "*"');
    expect(submitContactSource).toContain('functions.invoke("send-website-email"');
    expect(submitContactSource).toContain("createClient(supabaseUrl, supabaseServiceRoleKey");
  });

  it("notifies all Trusted Bums owners when someone is waiting for support", () => {
    expect(sendWebsiteEmailSource).toContain('"ryanmp29@gmail.com"');
    expect(sendWebsiteEmailSource).toContain('"bscott@ourcassell.com"');
    expect(sendWebsiteEmailSource).toContain('"tomwatsonuscga@gmail.com"');
    expect(sendWebsiteEmailSource).toContain('"cpetersonluv@gmail.com"');
    expect(sendWebsiteEmailSource).toContain('"bums@trustedbums.com"');
    expect(sendWebsiteEmailSource).toContain("Someone is waiting for Trusted Bums support");
    expect(sendWebsiteEmailSource).toContain("uniqueEmails(websiteContactNotifyTo).map");
  });
});
