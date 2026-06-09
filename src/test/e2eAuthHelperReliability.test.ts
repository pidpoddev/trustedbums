import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const authHelperSource = readFileSync("tests/e2e/helpers/auth.ts", "utf8");
const authenticatedSmokeSource = readFileSync("tests/e2e/authenticated-role-smoke.spec.ts", "utf8");

describe("authenticated E2E auth helper reliability", () => {
  it("does not use a fixed post-terms timeout to settle protected routes", () => {
    expect(authHelperSource).toContain("waitForProtectedRouteSettle");
    expect(authHelperSource).toContain("page.isClosed()");
    expect(authHelperSource).not.toContain("waitForTimeout(750)");
  });

  it("reuses the current authenticated session for same-test route hops", () => {
    expect(authenticatedSmokeSource).toContain("goToPathWithCurrentSession");
    expect(authenticatedSmokeSource).toContain('goToPathWithCurrentSession(page, "/client/exports")');
    expect(authenticatedSmokeSource).not.toContain('goToAuthedPath(page, finance, "/client/exports")');
  });
});
