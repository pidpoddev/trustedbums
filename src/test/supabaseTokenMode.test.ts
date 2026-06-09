import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const supabaseSource = readFileSync("src/lib/supabase.ts", "utf8");

describe("Supabase token mode", () => {
  it("prefers the current Clerk session token for Data API RLS checks", () => {
    expect(supabaseSource).toContain('let preferredDataAccessTokenMode: SupabaseAccessTokenMode = "session";');
    expect(supabaseSource).toContain('preferredDataAccessTokenMode = "session";');
    expect(supabaseSource).toContain("getAlternateAccessTokenMode");
  });
});
