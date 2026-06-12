import { C, slideBase, title, card, source } from "./helpers.mjs";

export async function slide02(presentation, ctx) {
  const slide = slideBase(presentation, ctx, "WHY NOW");
  title(slide, ctx, "K2view is selling into a board-level data problem.", "The public story is strong: AI-ready, governed, real-time enterprise data products. The access challenge is getting that story to the right buyers at the right moment.");
  card(slide, ctx, { x: 78, y: 278, w: 330, h: 230, label: "K2VIEW POSITION", body: "Deliver protected, real-time, complete data products that power AI, operational systems, and analytics.", accent: C.k2 });
  card(slide, ctx, { x: 474, y: 278, w: 330, h: 230, label: "BUYER REALITY", body: "The best-fit buyers are often buried in data, AI, risk, operations, and transformation committees.", accent: C.amber });
  card(slide, ctx, { x: 870, y: 278, w: 330, h: 230, label: "ACCESS GAP", body: "Cold education is hard when the real pain sits across CIO, CDO, app modernization, data governance, QA, and GenAI owners.", accent: C.orange });
  source(slide, ctx, "Sources: K2view homepage; K2view AI-Ready Data page; K2view Company Overview PDF.");
  return slide;
}
