import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const potentialDecisionMakerMatchesSource = readFileSync(
  "supabase/migrations/20260609153000_add_potential_decision_maker_matches.sql",
  "utf8",
);

describe("potential decision maker matches migration", () => {
  it("records where researched matches came from", () => {
    expect(potentialDecisionMakerMatchesSource).toContain("source_label text not null default 'Research Bot'");
    expect(potentialDecisionMakerMatchesSource).toContain("'Research Bot'");
    expect(potentialDecisionMakerMatchesSource).toContain("Public-search LinkedIn URL candidate; manual LinkedIn verification not performed.");
  });

  it("keeps Bum access tied to accepted opportunities", () => {
    expect(potentialDecisionMakerMatchesSource).toContain('"Bums can read accepted opportunity decision maker matches"');
    expect(potentialDecisionMakerMatchesSource).toContain("private.is_bum()");
    expect(potentialDecisionMakerMatchesSource).toContain("public.opportunity_registrations opportunity");
    expect(potentialDecisionMakerMatchesSource).toContain("opportunity.status = 'Accepted'");
  });

  it("tracks LinkedIn as a manual verification candidate, not a scraped truth source", () => {
    expect(potentialDecisionMakerMatchesSource).toContain("linkedin_url_candidate text");
    expect(potentialDecisionMakerMatchesSource).toContain("linkedin_manual_check text not null default 'not_checked'");
    expect(potentialDecisionMakerMatchesSource).toContain("linkedin_manual_check in ('not_checked', 'user_verified_current', 'user_verified_not_current', 'user_unsure')");
  });
});
