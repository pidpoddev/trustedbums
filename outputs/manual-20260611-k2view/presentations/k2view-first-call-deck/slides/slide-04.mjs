import { C, slideBase, title, card, source } from "./helpers.mjs";

export async function slide04(presentation, ctx) {
  const slide = slideBase(presentation, ctx, "K2VIEW SIGNALS");
  title(slide, ctx, "The strongest entry points are tied to urgent enterprise workloads.", "K2view's public materials point to several buyer conversations where warm access can matter more than top-of-funnel volume.");
  card(slide, ctx, { x: 80, y: 260, w: 260, h: 230, label: "AGENTIC AI", body: "AI-ready data, enterprise RAG, data-grounded chatbots, MCP integration, and governed context.", accent: C.k2, bodySize: 17 });
  card(slide, ctx, { x: 366, y: 260, w: 260, h: 230, label: "CUSTOMER 360", body: "Real-time customer views, golden records, 100s of connectors, and built-in governance.", accent: C.k2b, bodySize: 17 });
  card(slide, ctx, { x: 652, y: 260, w: 260, h: 230, label: "TEST DATA", body: "Synthetic data, masking, tokenization, test data management, and safer development.", accent: C.amber, bodySize: 17 });
  card(slide, ctx, { x: 938, y: 260, w: 260, h: 230, label: "MODERNIZATION", body: "Cloud migration, legacy integration, data fabric, data mesh, and mainframe modernization.", accent: C.orange, bodySize: 17 });
  source(slide, ctx, "Sources: K2view homepage navigation and solution pages; K2view Company Overview PDF.");
  return slide;
}
