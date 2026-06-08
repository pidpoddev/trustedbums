import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const packageJson = readFileSync("package.json", "utf8");
const lockfile = readFileSync("pnpm-lock.yaml", "utf8");
const appSource = readFileSync("src/App.tsx", "utf8");
const metadataSource = readFileSync("src/components/RouteMetadata.tsx", "utf8");
const htmlShell = readFileSync("index.html", "utf8");
const htaccess = readFileSync("public/.htaccess", "utf8");
const handoffsSource = readFileSync("src/pages/admin/AdminHandoffs.tsx", "utf8");
const captureMigration = readFileSync("supabase/migrations/20260608141000_limit_raw_extension_capture_reads.sql", "utf8");
const qaBacklog = readFileSync("docs/qa-test-backlog.md", "utf8");

describe("scrum implementation queue regression coverage", () => {
  it("removes the unused Clerk extension SDK dependency path", () => {
    expect(packageJson).not.toContain("@clerk/chrome-extension");
    expect(lockfile).not.toContain("@clerk/chrome-extension@");
    expect(lockfile).not.toContain("uuid@8.3.2");
  });

  it("emits route-aware metadata and baseline production headers", () => {
    expect(appSource).toContain("RouteMetadata");
    expect(metadataSource).toContain("https://trustedbums.com");
    expect(metadataSource).toContain("document.title = title");
    expect(metadataSource).toContain('meta[property="og:url"]');
    expect(metadataSource).toContain("window.location.pathname");
    expect(htmlShell).toContain('href="https://trustedbums.com/"');
    expect(htmlShell).toContain('content="https://trustedbums.com/og-image.svg"');
    expect(htaccess).toContain("Strict-Transport-Security");
    expect(htaccess).toContain("Content-Security-Policy");
    expect(htaccess).toContain("frame-ancestors 'none'");
    expect(htaccess).toContain("https://vaoqvtxqvbptyxddpoju.supabase.co");
    expect(htaccess).toContain("https://challenges.cloudflare.com");
  });

  it("surfaces operational handoff triage signals and filters", () => {
    expect(handoffsSource).toContain('type HandoffFilter = "OPEN" | "URGENT" | "STALE" | "MINE" | "UNOWNED" | "NOTIFICATION_FAILED" | "ALL"');
    expect(handoffsSource).toContain("OperationalBadges");
    expect(handoffsSource).toContain("admin_priority");
    expect(handoffsSource).toContain("admin_next_action");
    expect(handoffsSource).toContain("notification_error");
    expect(handoffsSource).toContain("Urgent / high");
    expect(handoffsSource).toContain("Assigned to me");
    expect(handoffsSource).toContain("Notification failed");
  });

  it("keeps raw extension page captures creator-or-admin scoped", () => {
    expect(captureMigration).toContain('drop policy if exists "Users can read relevant extension captures"');
    expect(captureMigration).toContain('create policy "Users can read own or admin extension captures"');
    expect(captureMigration).toContain("private.is_admin()");
    expect(captureMigration).toContain("created_by = public.current_user_id()");
    expect(captureMigration).not.toContain("company_id =");
    expect(captureMigration).not.toContain("current_company_id()");
  });

  it("keeps the seeded live allow/deny proof lane explicit until fixtures exist", () => {
    expect(qaBacklog).toContain("Business Access Coverage");
    expect(qaBacklog).toContain("Extension API destinations and page captures");
    expect(qaBacklog).toContain("Bum represented contacts");
    expect(qaBacklog).toContain("Client team, domain approval, and access-role assignment");
  });
});
