import { C, slideBase, source } from "./helpers.mjs";

export async function slide01(presentation, ctx) {
  const slide = slideBase(presentation, ctx);
  ctx.addText(slide, { text: "K2view x Trusted Bums", x: 72, y: 110, w: 780, h: 58, size: 28, bold: true, color: C.k2b, typeface: ctx.fonts.title });
  ctx.addText(slide, { text: "Warm routes into enterprise data and AI buyers who already feel the pain", x: 72, y: 180, w: 740, h: 178, size: 42, bold: true, color: C.ink, typeface: ctx.fonts.title });
  ctx.addText(slide, { text: "A first-call strategy deck for exploring whether Trusted Bums can help K2view reach high-value enterprise accounts through credible relationship paths instead of more cold outbound.", x: 76, y: 374, w: 700, h: 74, size: 20, color: C.muted, typeface: ctx.fonts.body });
  ctx.addShape(slide, { x: 870, y: 132, w: 286, h: 286, fill: "#39D98A18", line: ctx.line(C.k2, 2), geometry: "roundRect" });
  ctx.addText(slide, { text: "AI-ready data\nmeets\nwarm access", x: 907, y: 198, w: 212, h: 150, size: 29, bold: true, color: C.ink, align: "center", typeface: ctx.fonts.title });
  ctx.addShape(slide, { x: 936, y: 370, w: 154, h: 8, fill: C.orange, geometry: "roundRect" });
  source(slide, ctx, "Prepared from public K2view sources and Trusted Bums operating docs. Buyer/contact specifics not yet supplied.");
  return slide;
}
