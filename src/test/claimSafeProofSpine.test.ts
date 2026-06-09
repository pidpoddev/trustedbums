import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const proofSpine = readFileSync("docs/claim-safe-proof-spine.md", "utf8");

describe("claim-safe proof spine", () => {
  it("documents the reusable proof narrative and required audience variants", () => {
    expect(proofSpine).toContain("Trusted Bums helps companies work the accounts they cannot reach cold");
    expect(proofSpine).toContain("Variant: Client Acquisition");
    expect(proofSpine).toContain("Variant: Investor Or Advisor Referral Ask");
    expect(proofSpine).toContain("Variant: Bum Recruiting");
  });

  it("keeps proof categories explicit before campaign scaling", () => {
    expect(proofSpine).toContain("Approved Public Proof Categories");
    expect(proofSpine).toContain("Private Or Internal-Only Proof");
    expect(proofSpine).toContain("Do Not Say");
    expect(proofSpine).toContain("does not guarantee meetings");
    expect(proofSpine).toContain("does not guarantee approval, payment, payout timing, or future opportunities");
  });

  it("tells agents and campaign owners to classify claims before publishing", () => {
    expect(proofSpine).toContain("Content, B2B Growth, Marketing Graphics, Trust, Product Ops, and founder-script work");
    expect(proofSpine).toContain("Any new proof claim should be classified as approved public, private/internal-only, or forbidden before it ships.");
    expect(proofSpine).toContain("If an agent cannot classify a claim, it should request review instead of publishing the claim.");
  });
});
