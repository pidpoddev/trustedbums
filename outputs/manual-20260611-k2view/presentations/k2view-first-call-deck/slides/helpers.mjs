export const C = {
  bg: "#0B1220",
  bg2: "#101A2D",
  panel: "#162238",
  panel2: "#1E2D48",
  ink: "#F8FAFC",
  muted: "#A8B3C7",
  soft: "#D7DEE9",
  k2: "#39D98A",
  k2b: "#74F2CE",
  orange: "#F97316",
  amber: "#FDBA74",
  line: "#334155",
  white: "#FFFFFF",
};

export function slideBase(presentation, ctx, section = "FIRST CALL DECK") {
  const slide = presentation.slides.add();
  ctx.addShape(slide, { x: 0, y: 0, w: ctx.W, h: ctx.H, fill: C.bg });
  ctx.addShape(slide, { x: 0, y: 0, w: ctx.W, h: 720, fill: C.bg });
  ctx.addShape(slide, { x: 0, y: 0, w: 14, h: ctx.H, fill: C.orange });
  ctx.addText(slide, {
    text: "TRUSTED BUMS",
    x: 42,
    y: 30,
    w: 210,
    h: 24,
    size: 18,
    bold: true,
    color: C.orange,
    typeface: ctx.fonts.title,
  });
  ctx.addText(slide, {
    text: section,
    x: 980,
    y: 32,
    w: 245,
    h: 20,
    size: 13,
    color: C.muted,
    align: "right",
    typeface: ctx.fonts.mono,
  });
  return slide;
}

export function title(slide, ctx, text, subtitle) {
  ctx.addText(slide, {
    text,
    x: 72,
    y: 84,
    w: 760,
    h: 94,
    size: 39,
    bold: true,
    color: C.ink,
    typeface: ctx.fonts.title,
  });
  if (subtitle) {
    ctx.addText(slide, {
      text: subtitle,
      x: 74,
      y: 178,
      w: 790,
      h: 54,
      size: 19,
      color: C.muted,
      typeface: ctx.fonts.body,
    });
  }
}

export function kicker(slide, ctx, text, x = 74, y = 248, w = 360) {
  ctx.addShape(slide, { x, y, w, h: 30, fill: "#39D98A22", line: ctx.line(C.k2, 1), geometry: "roundRect" });
  ctx.addText(slide, { text, x: x + 12, y: y + 6, w: w - 24, h: 18, size: 12, bold: true, color: C.k2b, typeface: ctx.fonts.mono });
}

export function card(slide, ctx, { x, y, w, h, label, body, accent = C.k2, bodySize = 18 }) {
  ctx.addShape(slide, { x, y, w, h, fill: C.panel, line: ctx.line("#26364F", 1), geometry: "roundRect" });
  ctx.addShape(slide, { x, y, w: 5, h, fill: accent });
  ctx.addText(slide, { text: label, x: x + 22, y: y + 18, w: w - 44, h: 24, size: 14, bold: true, color: accent, typeface: ctx.fonts.mono });
  ctx.addText(slide, { text: body, x: x + 22, y: y + 50, w: w - 44, h: h - 62, size: bodySize, color: C.soft, typeface: ctx.fonts.body });
}

export function source(slide, ctx, text) {
  ctx.addText(slide, { text, x: 72, y: 672, w: 1090, h: 24, size: 9.5, color: "#7F8EA6", typeface: ctx.fonts.body });
}

export function pill(slide, ctx, text, x, y, w, color = C.k2) {
  ctx.addShape(slide, { x, y, w, h: 34, fill: `${color}22`, line: ctx.line(color, 1), geometry: "roundRect" });
  ctx.addText(slide, { text, x: x + 12, y: y + 8, w: w - 24, h: 18, size: 13, bold: true, color: C.ink, align: "center", typeface: ctx.fonts.body });
}

export function arrow(slide, ctx, x1, y1, x2, y2, color = C.k2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);
  ctx.addShape(slide, { x: x1, y: y1 - 2, w: len, h: 4, fill: color, line: ctx.line(color, 0), geometry: "rect", rotation: angle * 180 / Math.PI });
  ctx.addShape(slide, { x: x2 - 7, y: y2 - 7, w: 14, h: 14, fill: color, line: ctx.line(color, 0), geometry: "triangle", rotation: angle * 180 / Math.PI + 90 });
}
