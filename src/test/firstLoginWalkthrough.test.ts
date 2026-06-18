import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const walkthroughSource = readFileSync("src/components/FirstLoginWalkthrough.tsx", "utf8");
const clientLayoutSource = readFileSync("src/layouts/ClientLayout.tsx", "utf8");
const bumLayoutSource = readFileSync("src/layouts/BumLayout.tsx", "utf8");
const adminLayoutSource = readFileSync("src/layouts/AdminLayout.tsx", "utf8");
const headerActionsSource = readFileSync("src/components/PortalHeaderActions.tsx", "utf8");
const walkthroughEventSource = readFileSync("src/lib/firstLoginWalkthrough.ts", "utf8");

describe("first login walkthrough", () => {
  it("mounts the walkthrough only in Client and Bum portal layouts", () => {
    expect(clientLayoutSource).toContain("FirstLoginWalkthrough");
    expect(bumLayoutSource).toContain("FirstLoginWalkthrough");
    expect(adminLayoutSource).not.toContain("FirstLoginWalkthrough");
  });

  it("keeps Admin out of the walkthrough and manual launcher", () => {
    expect(walkthroughSource).not.toContain('role === "ADMIN"');
    expect(walkthroughSource).not.toContain("/admin");
    expect(headerActionsSource).toContain('user?.role === "CLIENT" || user?.role === "BUM"');
    expect(headerActionsSource).toContain("Show walkthrough");
    expect(headerActionsSource).toContain("@/lib/firstLoginWalkthrough");
  });

  it("stores completion per user, role, client access role, and version", () => {
    expect(walkthroughSource).toContain("WALKTHROUGH_VERSION");
    expect(walkthroughSource).toContain("trustedbums:first-login-walkthrough");
    expect(walkthroughSource).toContain("window.localStorage.setItem(storageKey, \"complete\")");
    expect(walkthroughSource).toContain("isImpersonating");
    expect(walkthroughEventSource).toContain("trustedbums:open-first-login-walkthrough");
  });

  it("lets automated QA disable only the first-login autostart", () => {
    expect(walkthroughEventSource).toContain("FIRST_LOGIN_WALKTHROUGH_AUTOSTART_DISABLED_KEY");
    expect(walkthroughEventSource).toContain("trustedbums:first-login-walkthrough:disable-autostart");
    expect(walkthroughSource).toContain("FIRST_LOGIN_WALKTHROUGH_AUTOSTART_DISABLED_KEY");
  });

  it("explains the Bum Inner Circle during setup", () => {
    expect(walkthroughSource).toContain("Start with your Inner Circle");
    expect(walkthroughSource).toContain("up to 20 trusted direct relationships for now");
    expect(walkthroughSource).toContain("stay visible in My Contacts and on any Claims that use them");
    expect(walkthroughSource).toContain("Grow beyond the Inner Circle");
  });
});
