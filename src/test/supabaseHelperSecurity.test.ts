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

const rlsHelperFunctions = [
  "public.can_add_conversation_participant(uuid)",
  "public.company_has_customer_targets(uuid)",
  "public.conversation_company_id(uuid)",
  "public.current_company_id()",
  "public.is_admin()",
  "public.is_bum()",
  "public.is_conversation_participant(uuid)",
];

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
});
