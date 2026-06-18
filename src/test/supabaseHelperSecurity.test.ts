import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const helperSecurityMigration = readFileSync(
  "supabase/migrations/20260607201000_restrict_security_definer_helper_execute.sql",
  "utf8",
);
const rlsHelperGrantMigration = readFileSync(
  "supabase/migrations/20260608010000_restore_rls_helper_execute_grants.sql",
  "utf8",
);
const privateRlsHelperMigration = readFileSync(
  "supabase/migrations/20260608013000_move_rls_helpers_to_private_schema.sql",
  "utf8",
);
const privateRlsPolicyMigration = readFileSync(
  "supabase/migrations/20260608013500_qualify_private_rls_helper_references.sql",
  "utf8",
);
const authBoundaryHelperMigration = readFileSync(
  "supabase/migrations/20260616110000_harden_auth_boundary_helpers.sql",
  "utf8",
);
const claimNotificationPreviewMigration = readFileSync(
  "supabase/migrations/20260617113000_make_claim_notification_previews_security_invoker.sql",
  "utf8",
);
const adminScrumOwnerSyncSearchPathMigration = readFileSync(
  "supabase/migrations/20260618093000_set_admin_scrum_owner_sync_search_path.sql",
  "utf8",
);
const portalApiSource = readFileSync("src/lib/portalApi.ts", "utf8");
const duplicateCheckFunctionSource = readFileSync(
  "supabase/functions/customer-lead-duplicate-check/index.ts",
  "utf8",
);

const rlsHelperFunctions = [
  "public.can_add_conversation_participant(uuid)",
  "public.company_has_customer_targets(uuid)",
  "public.conversation_company_id(uuid)",
  "public.current_company_id()",
  "public.is_admin()",
  "public.is_bum()",
  "public.is_conversation_participant(uuid)",
];
const privateRlsHelperFunctions = rlsHelperFunctions.map((helperFunction) =>
  helperFunction.replace("public.", "private."),
);

describe("Supabase helper function security", () => {
  it("keeps the original broad public execute revokes for exposed security-definer helper functions", () => {
    for (const helperFunction of [...rlsHelperFunctions, "public.prevent_profile_self_authorization_mutation()"]) {
      expect(helperSecurityMigration).toContain(`revoke execute on function ${helperFunction} from public;`);
      expect(helperSecurityMigration).toContain(`revoke execute on function ${helperFunction} from anon;`);
      expect(helperSecurityMigration).toContain(`revoke execute on function ${helperFunction} from authenticated;`);
    }
  });

  it("restores role-scoped execute grants for helpers used inside RLS policies", () => {
    for (const helperFunction of rlsHelperFunctions) {
      expect(rlsHelperGrantMigration).toContain(`grant execute on function ${helperFunction} to anon, authenticated;`);
    }
  });

  it("moves RLS helper functions out of the exposed public RPC schema", () => {
    expect(privateRlsHelperMigration).toContain("create schema if not exists private;");
    expect(privateRlsHelperMigration).toContain("grant usage on schema private to anon, authenticated;");

    for (const helperFunction of rlsHelperFunctions) {
      expect(privateRlsHelperMigration).toContain(`alter function ${helperFunction} set schema private;`);
    }
    for (const helperFunction of privateRlsHelperFunctions) {
      expect(privateRlsHelperMigration).toContain(`grant execute on function ${helperFunction} to anon, authenticated;`);
    }
  });

  it("qualifies policy and helper references after moving helpers private", () => {
    expect(privateRlsPolicyMigration).toContain("or thread.company_id = private.current_company_id()");
    expect(privateRlsPolicyMigration).toContain("if not private.is_admin() then");
    expect(privateRlsPolicyMigration).toContain("current_is_admin boolean := private.is_admin();");
    expect(privateRlsPolicyMigration).toContain(
      "regexp_replace(updated_using, '(^|[^.[:alnum:]_])is_admin\\(\\)'",
    );
    expect(privateRlsPolicyMigration).toContain(
      "regexp_replace(updated_check, '(^|[^.[:alnum:]_])current_company_id\\(\\)'",
    );
  });

  it("does not restore direct caller execute access for trigger-only authorization guards", () => {
    expect(rlsHelperGrantMigration).not.toContain(
      "grant execute on function public.prevent_profile_self_authorization_mutation()",
    );
    expect(rlsHelperGrantMigration).toContain(
      "revoke execute on function public.prevent_profile_self_authorization_mutation() from public;",
    );
    expect(rlsHelperGrantMigration).toContain(
      "revoke execute on function public.prevent_profile_self_authorization_mutation() from anon;",
    );
    expect(rlsHelperGrantMigration).toContain(
      "revoke execute on function public.prevent_profile_self_authorization_mutation() from authenticated;",
    );
  });

  it("sets an explicit search path on the submitted-opportunity trigger helper", () => {
    expect(helperSecurityMigration).toContain(
      "alter function public.normalize_submitted_opportunity_status() set search_path = public;",
    );
  });

  it("removes exposed execution from admin audit and customer-lead duplicate helpers", () => {
    for (const helperFunction of [
      "public.record_admin_scrum_item_audit_event()",
      "public.set_admin_scrum_item_audit_fields()",
      "public.find_customer_lead_duplicate(uuid, text)",
      "public.normalize_customer_domain(text)",
    ]) {
      expect(authBoundaryHelperMigration).toContain(`revoke execute on function ${helperFunction} from public;`);
      expect(authBoundaryHelperMigration).toContain(`revoke execute on function ${helperFunction} from anon;`);
      expect(authBoundaryHelperMigration).toContain(`revoke execute on function ${helperFunction} from authenticated;`);
      expect(authBoundaryHelperMigration).toContain(`grant execute on function ${helperFunction} to service_role;`);
    }

    expect(authBoundaryHelperMigration).toContain(
      "alter function public.normalize_customer_domain(text) set search_path = public, pg_temp;",
    );
  });

  it("keeps customer-lead duplicate checks behind a signed-in Edge Function", () => {
    expect(portalApiSource).toContain("/functions/v1/customer-lead-duplicate-check");
    expect(portalApiSource).not.toContain(".rpc(\"find_customer_lead_duplicate\"");
    expect(duplicateCheckFunctionSource).toContain("getBearerToken(request)");
    expect(duplicateCheckFunctionSource).toContain("Only Bums can check customer lead duplicates.");
    expect(duplicateCheckFunctionSource).toContain(".rpc(\"find_customer_lead_duplicate\"");
  });

  it("keeps claim notification previews out of security-definer view mode", () => {
    expect(claimNotificationPreviewMigration).toContain("create or replace view public.claim_client_notification_previews");
    expect(claimNotificationPreviewMigration).toContain("with (security_invoker = true)");
    expect(claimNotificationPreviewMigration).toContain(
      "revoke all on public.claim_client_notification_previews from public;",
    );
    expect(claimNotificationPreviewMigration).toContain(
      "revoke all on public.claim_client_notification_previews from anon;",
    );
    expect(claimNotificationPreviewMigration).toContain(
      "revoke all on public.claim_client_notification_previews from authenticated;",
    );
    expect(claimNotificationPreviewMigration).toContain(
      "grant select on public.claim_client_notification_previews to authenticated;",
    );
  });

  it("sets an explicit search path on the admin scrum owner sync trigger helper", () => {
    expect(adminScrumOwnerSyncSearchPathMigration).toContain(
      "alter function public.sync_admin_scrum_item_owner_fields() set search_path = public;",
    );
  });
});
