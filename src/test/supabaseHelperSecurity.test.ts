import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const helperSecurityMigration = readFileSync(
  "supabase/migrations/20260607201000_restrict_security_definer_helper_execute.sql",
  "utf8",
);

const helperFunctions = [
  "public.can_add_conversation_participant(uuid)",
  "public.company_has_customer_targets(uuid)",
  "public.conversation_company_id(uuid)",
  "public.current_company_id()",
  "public.is_admin()",
  "public.is_bum()",
  "public.is_conversation_participant(uuid)",
  "public.prevent_profile_self_authorization_mutation()",
];

describe("Supabase helper function security", () => {
  it("revokes direct execute access from exposed security-definer helper functions", () => {
    for (const helperFunction of helperFunctions) {
      expect(helperSecurityMigration).toContain(`revoke execute on function ${helperFunction} from public;`);
      expect(helperSecurityMigration).toContain(`revoke execute on function ${helperFunction} from anon;`);
      expect(helperSecurityMigration).toContain(`revoke execute on function ${helperFunction} from authenticated;`);
    }
  });

  it("sets an explicit search path on the submitted-opportunity trigger helper", () => {
    expect(helperSecurityMigration).toContain(
      "alter function public.normalize_submitted_opportunity_status() set search_path = public;",
    );
  });
});
