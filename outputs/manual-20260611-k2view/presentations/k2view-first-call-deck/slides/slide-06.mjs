import { C, slideBase, title, card, source } from "./helpers.mjs";

export async function slide06(presentation, ctx) {
  const slide = slideBase(presentation, ctx, "HOW IT WORKS");
  title(slide, ctx, "Trusted Bums turns relationship access into a controlled workflow.", "The point is not to buy introductions. The point is to find credible access, add context, and keep every step reviewed.");
  card(slide, ctx, { x: 92, y: 262, w: 240, h: 210, label: "1. DEFINE", body: "K2view supplies target accounts, buyer problem, proof, and disqualifiers.", accent: C.k2, bodySize: 17 });
  card(slide, ctx, { x: 370, y: 262, w: 240, h: 210, label: "2. MATCH", body: "Bums surface credible routes through prior colleagues, operators, partners, customers, or advisors.", accent: C.k2b, bodySize: 17 });
  card(slide, ctx, { x: 648, y: 262, w: 240, h: 210, label: "3. REVIEW", body: "Trusted Bums checks fit, claim quality, relationship basis, and next-step risk before action.", accent: C.amber, bodySize: 17 });
  card(slide, ctx, { x: 926, y: 262, w: 240, h: 210, label: "4. ACT", body: "Only credible routes move to a warm ask, meeting, intro support, and tracked opportunity.", accent: C.orange, bodySize: 17 });
  ctx.addText(slide, { text: "Control matters because K2view sells into sensitive data, AI, governance, and regulated-enterprise environments.", x: 100, y: 540, w: 980, h: 42, size: 24, bold: true, color: C.ink, typeface: ctx.fonts.title });
  source(slide, ctx, "Source: Trusted Bums operating model and product workflow docs.");
  return slide;
}
