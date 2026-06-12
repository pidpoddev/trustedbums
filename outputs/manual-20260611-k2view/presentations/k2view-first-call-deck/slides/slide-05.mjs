import { C, slideBase, title, pill, arrow, source } from "./helpers.mjs";

export async function slide05(presentation, ctx) {
  const slide = slideBase(presentation, ctx, "ROUTE HYPOTHESIS");
  title(slide, ctx, "Start with accounts where K2view's proof already matches executive pain.", "The first pilot should not ask Bums for broad intros. It should test named-account route quality against a narrow set of account triggers.");
  pill(slide, ctx, "Target-account trigger", 96, 274, 220, C.k2);
  pill(slide, ctx, "Credible Bum route", 410, 274, 210, C.amber);
  pill(slide, ctx, "Warm context ask", 704, 274, 210, C.orange);
  pill(slide, ctx, "K2view strategy review", 990, 274, 210, C.k2);
  arrow(slide, ctx, 330, 291, 395, 291, "#64748B");
  arrow(slide, ctx, 634, 291, 688, 291, "#64748B");
  arrow(slide, ctx, 928, 291, 975, 291, "#64748B");
  ctx.addText(slide, { text: "Example triggers to test", x: 112, y: 392, w: 310, h: 26, size: 16, bold: true, color: C.k2b, typeface: ctx.fonts.mono });
  ctx.addText(slide, { text: "AI initiative lacks governed real-time context\nCustomer 360 program is stuck in integration work\nTDM or privacy program blocks delivery speed\nMainframe/cloud modernization needs safer data access", x: 112, y: 430, w: 525, h: 128, size: 20, color: C.soft, typeface: ctx.fonts.body });
  ctx.addText(slide, { text: "NEEDS RYAN INPUT", x: 720, y: 392, w: 260, h: 26, size: 16, bold: true, color: C.orange, typeface: ctx.fonts.mono });
  ctx.addText(slide, { text: "K2view target account shortlist\nKnown relationship routes\nPreferred vertical focus\nInitial buyer persona or sponsor", x: 720, y: 430, w: 420, h: 128, size: 20, color: C.soft, typeface: ctx.fonts.body });
  source(slide, ctx, "Route hypothesis only. No target-account list or relationship data was provided.");
  return slide;
}
