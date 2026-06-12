import { C, slideBase, title, card, source } from "./helpers.mjs";

export async function slide08(presentation, ctx) {
  const slide = slideBase(presentation, ctx, "PROOF TO USE");
  title(slide, ctx, "K2view already has enterprise credibility. Trusted Bums should use it carefully.", "The first-call asset should borrow only public, supportable proof and avoid turning customer names into implied endorsements.");
  card(slide, ctx, { x: 82, y: 268, w: 250, h: 220, label: "PUBLIC SCALE", body: "7+ billion daily data product requests, 4+ billion Micro-Databases, 190 ms average query response.", accent: C.k2, bodySize: 17 });
  card(slide, ctx, { x: 362, y: 268, w: 250, h: 220, label: "PUBLIC CUSTOMERS", body: "K2view lists enterprise names including AT&T, Regions Bank, Sun Life, BBVA, Hapag-Lloyd, Vodafone, and Verizon.", accent: C.k2b, bodySize: 17 });
  card(slide, ctx, { x: 642, y: 268, w: 250, h: 220, label: "ANALYST SIGNAL", body: "K2view says it was named a Visionary in the 2025 Gartner Magic Quadrant for Data Integration Tools.", accent: C.amber, bodySize: 17 });
  card(slide, ctx, { x: 922, y: 268, w: 250, h: 220, label: "RECENT FUNDING", body: "Trinity announced $15M to support demand for agentic AI data infrastructure.", accent: C.orange, bodySize: 17 });
  source(slide, ctx, "Sources: K2view homepage; Trinity Capital press release. Use customer/analyst claims exactly as sourced and review before sending.");
  return slide;
}
