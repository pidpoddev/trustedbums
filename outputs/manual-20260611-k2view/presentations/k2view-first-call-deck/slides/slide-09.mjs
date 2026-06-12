import { C, slideBase, title, card, source } from "./helpers.mjs";

export async function slide09(presentation, ctx) {
  const slide = slideBase(presentation, ctx, "PILOT DESIGN");
  title(slide, ctx, "A practical first pilot: 15 accounts, 3 route types, 30 days.", "The goal is not activity. It is whether credible relationship access can create better enterprise conversations for K2view.");
  card(slide, ctx, { x: 92, y: 256, w: 310, h: 244, label: "INPUT", body: "15 named accounts\n1 trigger per account\nPreferred use case\nDisqualifiers\nApproved intro language", accent: C.k2, bodySize: 18 });
  card(slide, ctx, { x: 486, y: 256, w: 310, h: 244, label: "ROUTE TEST", body: "Prior executive/operator\nCustomer or vendor path\nInvestor/advisor/partner path\nManual review before ask", accent: C.amber, bodySize: 18 });
  card(slide, ctx, { x: 880, y: 256, w: 310, h: 244, label: "SUCCESS READOUT", body: "Qualified warm routes found\nIntro quality\nMeeting relevance\nObjection themes\nNext-step conversion", accent: C.orange, bodySize: 18 });
  ctx.addText(slide, { text: "Decision after 30 days: expand vertical, change account criteria, narrow use case, or stop if route quality is weak.", x: 94, y: 554, w: 980, h: 38, size: 23, bold: true, color: C.ink, typeface: ctx.fonts.title });
  source(slide, ctx, "Pilot structure is a Trusted Bums recommendation, not an agreed K2view plan.");
  return slide;
}
