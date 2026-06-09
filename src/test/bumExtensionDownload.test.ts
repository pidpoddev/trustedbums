import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

const extensionManifest = JSON.parse(read("chrome-extension/trustedbums/manifest.json")) as {
  host_permissions: string[];
};

describe("Bum extension download gating", () => {
  it("keeps the pre-store extension out of public static assets", () => {
    expect(existsSync(join(root, "public/downloads/trustedbums-extension.zip"))).toBe(false);
    expect(existsSync(join(root, "supabase/functions/bum-extension-download/trustedbums-extension.zip"))).toBe(false);
    expect(existsSync(join(root, "supabase/functions/bum-extension-download/trustedbums-extension.zip.b64"))).toBe(false);
    expect(existsSync(join(root, "supabase/functions/bum-extension-download/trustedbums-extension.zip.enc"))).toBe(true);
  });

  it("forbids the old public download URL before the SPA fallback", () => {
    const htaccess = read("public/.htaccess");
    const denyRule = htaccess.indexOf("RewriteRule ^downloads/trustedbums-extension\\.zip$ - [F,L]");
    const fallbackRule = htaccess.indexOf("RewriteRule ^ index.html [L]");

    expect(denyRule).toBeGreaterThan(-1);
    expect(fallbackRule).toBeGreaterThan(denyRule);
  });

  it("serves the package only through the Bum-authenticated function and portal page", () => {
    const functionSource = read("supabase/functions/bum-extension-download/index.ts");
    const portalApi = read("src/lib/portalApi.ts");
    const trainingPage = read("src/pages/client/ClientTrainings.tsx");
    const config = read("supabase/config.toml");

    expect(functionSource).toContain('profile.role !== "BUM"');
    expect(functionSource).toContain('profile.access_status !== "APPROVED"');
    expect(functionSource).toContain("BUM_EXTENSION_PACKAGE_KEY_B64");
    expect(functionSource).toContain("trustedbums-extension.zip.enc");
    expect(portalApi).toContain("downloadBumExtensionPackage");
    expect(portalApi).toContain("/functions/v1/bum-extension-download");
    expect(trainingPage).toContain("Trusted Bums extension");
    expect(trainingPage).toContain('user?.role === "BUM"');
    expect(config).toContain("[functions.bum-extension-download]");
  });

  it("keeps pre-store extension host permissions narrowly scoped", () => {
    expect(extensionManifest.host_permissions).toContain("https://vaoqvtxqvbptyxddpoju.supabase.co/*");
    expect(extensionManifest.host_permissions).not.toContain("https://*.supabase.co/*");
    expect(extensionManifest.host_permissions).not.toContain("https://api.trustedbums.com/*");
  });
});
