import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const packageJson = readFileSync("package.json", "utf8");
const lockfile = readFileSync("pnpm-lock.yaml", "utf8");
const appSource = readFileSync("src/App.tsx", "utf8");
const metadataSource = readFileSync("src/components/RouteMetadata.tsx", "utf8");
const publicRouteMetadata = readFileSync("src/data/publicRouteMetadata.json", "utf8");
const metadataRenderer = readFileSync("scripts/render-route-metadata.mjs", "utf8");
const qaTargetPreflight = readFileSync("scripts/qa-target-preflight.mjs", "utf8");
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
    expect(publicRouteMetadata).toContain('"siteOrigin": "https://trustedbums.com"');
    expect(metadataSource).toContain("document.title = resolvedTitle");
    expect(metadataSource).toContain('meta[property="og:url"]');
    expect(metadataSource).toContain("window.location.pathname");
    expect(metadataSource).toContain("getPublicRouteMetadata");
    expect(publicRouteMetadata).toContain('"maxTitleLength": 32');
    expect(publicRouteMetadata).toContain('"title": "Trusted Bums | TrustedBums.com"');
    expect(publicRouteMetadata).toContain("TrustedBums.com is the official Trusted Bums website");
    expect(publicRouteMetadata).toContain('"path": "/privacy-policy"');
    expect(publicRouteMetadata).toContain('"title": "Privacy"');
    expect(publicRouteMetadata).toContain('"path": "/legal/terms-of-service"');
    expect(htmlShell).toContain("<title>Trusted Bums | TrustedBums.com</title>");
    expect(htmlShell).toContain('"alternateName": "TrustedBums.com"');
    expect(metadataRenderer).toContain("distDir");
    expect(metadataRenderer).toContain("renderRouteHtml");
    expect(metadataRenderer).toContain('<div id="root">');
    expect(metadataRenderer).toContain("<h1>${title}</h1>");
    expect(qaTargetPreflight).toContain("<title>[^<]*Trusted Bums[^<]*<\\/title>");
    expect(htmlShell).toContain('href="https://trustedbums.com/"');
    expect(htmlShell).toContain('content="https://trustedbums.com/og-image.svg"');
    expect(htaccess).toContain("Strict-Transport-Security");
    expect(htaccess).toContain("Content-Security-Policy");
    expect(htaccess).toContain("frame-ancestors 'none'");
    expect(htaccess).toContain("https://vaoqvtxqvbptyxddpoju.supabase.co");
    expect(htaccess).toContain("https://challenges.cloudflare.com");
    expect(htaccess).toContain("https://fonts.googleapis.com");
    expect(htaccess).toContain("https://static.cloudflareinsights.com");
    expect(htaccess).toContain("worker-src 'self' blob:");
    expect(htaccess).toContain("Serve generated public-route metadata snapshots");
    expect(htaccess).toContain("privacy-policy");
    expect(htaccess).toContain("terms-of-service");
    expect(htaccess).toContain("script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://clerk.trustedbums.com");
    expect(htaccess).toContain("frame-src https://challenges.cloudflare.com https://clerk.trustedbums.com");
  });

  it("surfaces operational handoff triage signals and filters", () => {
    expect(handoffsSource).toContain('type HandoffFilter = "OPEN" | "URGENT" | "STALE" | "MINE" | "UNOWNED" | "NOTIFICATION_FAILED" | "ALL"');
    expect(handoffsSource).toContain("OperationalBadges");
    expect(handoffsSource).toContain("admin_priority");
    expect(handoffsSource).toContain("admin_next_action");
    expect(handoffsSource).toContain("notification_error");
    expect(handoffsSource).toContain("followUpDeadline");
    expect(handoffsSource).toContain("function isStaleHandoff");
    expect(handoffsSource).toContain("activityAt(createdAt, updatedAt)");
    expect(handoffsSource).toContain("listAdminReverseOpportunities");
    expect(handoffsSource).toContain("ReverseOpportunityRow");
    expect(handoffsSource).toContain("Customer opportunities");
    expect(handoffsSource).toContain("claimReverseOpportunityHandoff");
    expect(handoffsSource).toContain("openReverseOpportunityStatuses");
    expect(handoffsSource).toContain("Urgent / high");
    expect(handoffsSource).toContain("Assigned to me");
    expect(handoffsSource).toContain("Delivery issue");
    expect(handoffsSource).toContain("Overdue / stale");
    expect(handoffsSource).not.toContain("Stale or notify failed");
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
    expect(qaBacklog).toContain("Bum represented contacts");
    expect(qaBacklog).toContain("unrelated Bums and client-company users deny");
    expect(qaBacklog).toContain("one authenticated browser or direct-data proof");
    expect(qaBacklog).toContain("one foreign Bum deny case");
  });
});
