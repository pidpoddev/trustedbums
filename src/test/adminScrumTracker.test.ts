import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const appSource = readFileSync("src/App.tsx", "utf8");
const adminLayoutSource = readFileSync("src/layouts/AdminLayout.tsx", "utf8");
const pageSource = readFileSync("src/pages/admin/AdminScrumTracker.tsx", "utf8");
const portalApiSource = readFileSync("src/lib/portalApi.ts", "utf8");
const companyRulesSource = readFileSync("docs/agents/company-wide-rules.md", "utf8");
const migrationSource = readFileSync("supabase/migrations/20260609025228_add_admin_scrum_items.sql", "utf8");
const metadataMigrationSource = readFileSync("supabase/migrations/20260609030014_extend_admin_scrum_items_tracking_metadata.sql", "utf8");
const seedMigrationSource = readFileSync("supabase/migrations/20260609030608_seed_admin_scrum_tracker_initial_history.sql", "utf8");
const hardeningMigrationSource = readFileSync("supabase/migrations/20260609100000_harden_admin_scrum_tracker_audit.sql", "utf8");

describe("admin scrum tracker", () => {
  it("adds an admin-only route and sidebar entry", () => {
    expect(appSource).toContain('const AdminScrumTracker = lazy(() => import("./pages/admin/AdminScrumTracker"))');
    expect(appSource).toContain('<Route path="scrum" element={<AdminScrumTracker />} />');
    expect(adminLayoutSource).toContain('{ title: "Scrum", url: "/admin/scrum"');
    expect(adminLayoutSource).toContain("ClipboardList");
  });

  it("stores tracker items behind admin RLS with stable tracking IDs", () => {
    expect(migrationSource).toContain("create table if not exists public.admin_scrum_items");
    expect(migrationSource).toContain("tracking_id text generated always as ('TB-' || lpad(tracking_number::text, 4, '0')) stored unique");
    expect(migrationSource).toContain("alter table public.admin_scrum_items enable row level security");
    expect(migrationSource).toContain('create policy "Admins can manage scrum items"');
    expect(migrationSource).toContain("using (private.is_admin())");
    expect(migrationSource).toContain("with check (private.is_admin())");
    expect(migrationSource).toContain("evidence_links text[] not null default '{}'");
  });

  it("separates bugs and records which agent added each item", () => {
    expect(metadataMigrationSource).toContain("add column if not exists item_type text not null default 'TASK'");
    expect(metadataMigrationSource).toContain("add column if not exists added_by_agent text not null default 'Lead Developer'");
    expect(metadataMigrationSource).toContain("add column if not exists source_key text");
    expect(metadataMigrationSource).toContain("admin_scrum_items_source_key_idx");
    expect(portalApiSource).toContain('export type AdminScrumItemType = "BUG" | "TASK" | "QA" | "SECURITY" | "RELEASE" | "DOCS" | "INFRA"');
    expect(pageSource).toContain("Open bugs");
    expect(pageSource).toContain("Added by agent");
    expect(pageSource).toContain("typeFilter");
  });

  it("exposes create, list, and update helpers for the admin UI", () => {
    expect(portalApiSource).toContain('export type AdminScrumItemStatus = "OPEN" | "IN_PROGRESS" | "BLOCKED" | "FIXED" | "CLOSED" | "WONT_FIX"');
    expect(portalApiSource).toContain('from("admin_scrum_items")');
    expect(portalApiSource).toContain("export async function listAdminScrumItems");
    expect(portalApiSource).toContain("export async function createAdminScrumItem");
    expect(portalApiSource).toContain("export async function updateAdminScrumItem");
    expect(portalApiSource).toContain('input.status === "CLOSED" || input.status === "WONT_FIX"');
    expect(portalApiSource).toContain("added_by_agent");
    expect(portalApiSource).toContain("assertScrumCloseoutProof");
    expect(portalApiSource).not.toContain("created_by: currentUserId");
    expect(portalApiSource).not.toContain("updated_by: currentUserId");
  });

  it("supports scrum workflow fields in Admin Tools", () => {
    expect(pageSource).toContain("Add Scrum Item");
    expect(pageSource).toContain("Tracked Items");
    expect(pageSource).toContain("Evidence links");
    expect(pageSource).toContain("Closeout note");
    expect(pageSource).toContain("P0 / P1");
    expect(pageSource).toContain("Legal queue");
    expect(pageSource).toContain("statusFilter");
    expect(pageSource).toContain("legalQueueOnly");
    expect(pageSource).toContain("Closeout proof required");
    expect(pageSource).toContain('htmlFor="scrum-search"');
    expect(pageSource).toContain('id="scrum-status-filter"');
  });

  it("documents and applies the field-help standard to scrum controls", () => {
    expect(companyRulesSource).toContain("New fields require clear labels and appropriate help");
    expect(companyRulesSource).toContain("High-risk fields must not rely on tooltip-only guidance");
    expect(pageSource).toContain("FieldLabel");
    expect(pageSource).toContain('aria-describedby="scrum-title-help"');
    expect(pageSource).toContain('aria-describedby="scrum-description-help"');
    expect(pageSource).toContain('aria-describedby="scrum-evidence-help"');
    expect(pageSource).toContain('aria-describedby="scrum-priority-help"');
    expect(pageSource).toContain('id="scrum-search-help"');
    expect(pageSource).toContain('aria-describedby="scrum-status-filter-help"');
  });

  it("backfills closed git work and current open items with stable source keys", () => {
    expect(seedMigrationSource).toContain("'git:9f42bf4'");
    expect(seedMigrationSource).toContain("'git:73f0b06'");
    expect(seedMigrationSource).toContain("'open:qa-current-head-workflow-rerun'");
    expect(seedMigrationSource).toContain("'open:service-role-seeded-authorization'");
    expect(seedMigrationSource).toContain("on conflict (source_key) where source_key is not null do update");
  });

  it("keeps admin scrum audit actors server-owned and closeout proof-backed", () => {
    expect(hardeningMigrationSource).toContain("admin_scrum_items_closeout_proof_check");
    expect(hardeningMigrationSource).toContain("cardinality(evidence_links) > 0");
    expect(hardeningMigrationSource).toContain("public.set_admin_scrum_item_audit_fields");
    expect(hardeningMigrationSource).toContain("new.created_by := actor_id");
    expect(hardeningMigrationSource).toContain("new.updated_by := actor_id");
    expect(hardeningMigrationSource).toContain("public.record_admin_scrum_item_audit_event");
    expect(hardeningMigrationSource).toContain("admin_scrum_item_closed");
    expect(hardeningMigrationSource).toContain("admin_scrum_items_created_by_idx");
    expect(hardeningMigrationSource).toContain("admin_scrum_items_updated_by_idx");
  });
});
