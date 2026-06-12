import { C, slideBase, title, card, source } from "./helpers.mjs";

export async function slide07(presentation, ctx) {
  const slide = slideBase(presentation, ctx, "TRUST CONTROLS");
  title(slide, ctx, "This should not feel like another outbound channel.", "For K2view, the brand risk of careless intros is too high. The pilot should be explicitly selective.");
  card(slide, ctx, { x: 84, y: 266, w: 330, h: 238, label: "NOT THIS", body: "Scraped lists\nGeneric cold email\nGuaranteed meetings\nAffiliate-style referral spam\nUncontrolled claims about relationships", accent: "#EF4444", bodySize: 18 });
  card(slide, ctx, { x: 476, y: 266, w: 330, h: 238, label: "INSTEAD", body: "Named-account hypotheses\nHuman relationship validation\nProof-safe context\nReviewed intro asks\nClear disqualification rules", accent: C.k2, bodySize: 18 });
  card(slide, ctx, { x: 868, y: 266, w: 330, h: 238, label: "PILOT STANDARD", body: "Small account batch\nKnown trigger per account\nDocumented route basis\nK2view-approved message\nMeasured meeting quality", accent: C.orange, bodySize: 18 });
  source(slide, ctx, "Trust/legal caveat: no compensation, endorsement, result, or customer-logo claims should be used without approval.");
  return slide;
}
