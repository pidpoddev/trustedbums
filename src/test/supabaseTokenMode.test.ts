import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const supabaseSource = readFileSync("src/lib/supabase.ts", "utf8");

describe("Supabase token mode", () => {
  it("prefers the Clerk Supabase JWT template for Data API RLS checks", () => {
    expect(supabaseSource).toContain('let preferredDataAccessTokenMode: SupabaseAccessTokenMode = "legacy";');
    expect(supabaseSource).toContain('preferredDataAccessTokenMode = "legacy";');
    expect(supabaseSource).toContain("getAlternateAccessTokenMode");
  });
});
