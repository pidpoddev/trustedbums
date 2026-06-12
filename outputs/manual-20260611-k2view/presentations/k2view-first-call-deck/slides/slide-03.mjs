import { C, slideBase, title, pill, arrow, source } from "./helpers.mjs";

export async function slide03(presentation, ctx) {
  const slide = slideBase(presentation, ctx, "BUYER FRICTION");
  title(slide, ctx, "The problem is not awareness. It is trusted context.", "Enterprise data buyers need to believe the platform can survive scale, security, governance, legacy integration, and internal politics.");
  const xs = [82, 310, 538, 766, 994];
  const labels = ["AI mandate", "Data is fragmented", "Risk slows approval", "Committees form", "Access stalls"];
  labels.forEach((label, i) => pill(slide, ctx, label, xs[i], 330, 160, i < 2 ? C.k2 : i < 4 ? C.amber : C.orange));
  for (let i = 0; i < 4; i++) arrow(slide, ctx, xs[i] + 162, 347, xs[i + 1] - 10, 347, "#64748B");
  ctx.addText(slide, { text: "Trusted Bums hypothesis", x: 88, y: 450, w: 300, h: 28, size: 16, bold: true, color: C.orange, typeface: ctx.fonts.mono });
  ctx.addText(slide, { text: "K2view does not need generic lead volume. It needs credible routes into accounts where a data or AI initiative is already visible, underfunded, risky, late, or politically stuck.", x: 88, y: 486, w: 1010, h: 70, size: 24, bold: true, color: C.ink, typeface: ctx.fonts.title });
  source(slide, ctx, "Buyer-stage hypothesis based on K2view public solution set and Trusted Bums operating model. Needs validation with Ryan/K2view.");
  return slide;
}
