import { C, slideBase, title, card, source } from "./helpers.mjs";

export async function slide10(presentation, ctx) {
  const slide = slideBase(presentation, ctx, "MUTUAL ACTION PLAN");
  title(slide, ctx, "The best next step is a focused strategy review.", "Use the first call to validate fit, not to pitch every feature of either company.");
  card(slide, ctx, { x: 88, y: 258, w: 330, h: 250, label: "BEFORE CALL", body: "Ryan confirms K2view contact role, target vertical, 5-15 accounts, and any known relationship routes.", accent: C.k2, bodySize: 18 });
  card(slide, ctx, { x: 474, y: 258, w: 330, h: 250, label: "ON CALL", body: "Align on buyer triggers, use cases, disqualifiers, proof boundaries, and what a high-quality intro means.", accent: C.amber, bodySize: 18 });
  card(slide, ctx, { x: 860, y: 258, w: 330, h: 250, label: "AFTER CALL", body: "Build account route map, draft approved ask, review first matches, and decide whether to launch the 30-day pilot.", accent: C.orange, bodySize: 18 });
  ctx.addText(slide, { text: "NEEDS RYAN INPUT: buyer name, meeting date, target accounts, and any existing K2view-approved messaging.", x: 92, y: 558, w: 1000, h: 28, size: 19, bold: true, color: C.k2b, typeface: ctx.fonts.body });
  source(slide, ctx, "Deck generated 2026-06-11 from public K2view sources and Trusted Bums docs.");
  return slide;
}
