import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const width = 1280;
const height = 720;
const outputWidth = 960;
const outputHeight = 540;
const fps = 6;
const durationSeconds = 42;
const frameCount = durationSeconds * fps;

const root = process.cwd();
const assetDir = path.join(root, "public", "video-assets");
const frameDir = path.join(assetDir, "bum-welcome-frames");
const posterPath = path.join(assetDir, "trusted-bums-bum-welcome-poster.svg");
const htmlPath = path.join(assetDir, "trusted-bums-bum-welcome-line-animation.html");

const colors = {
  ink: "#08111f",
  paper: "#fff8ef",
  paperAlt: "#fff0df",
  orange: "#ff7a1a",
  gold: "#ffc44d",
  green: "#1f9d70",
  muted: "#5e6470",
  white: "#ffffff",
};

const scenes = [
  {
    title: "You are officially a Bum.",
    subtitle: "That means you bring trusted relationships into places cold outreach cannot reach.",
    label: "Welcome",
  },
  {
    title: "Your network has context.",
    subtitle: "Past colleagues, customers, friends, and operators can become warm routes to real buyers.",
    label: "Relationships",
  },
  {
    title: "Clients share target accounts.",
    subtitle: "Trusted Bums surfaces opportunities where your background may create a credible path in.",
    label: "Targets",
  },
  {
    title: "Review the read-ahead.",
    subtitle: "You get the client story, buyer context, and what makes a good introduction.",
    label: "Preparation",
  },
  {
    title: "Claim only real relationships.",
    subtitle: "When the connection is genuine, make the intro with care and context.",
    label: "Introduction",
  },
  {
    title: "Track outcomes and earnings.",
    subtitle: "The portal keeps claims, meetings, revenue, commissions, and approvals aligned.",
    label: "Alignment",
  },
  {
    title: "Welcome to Trusted Bums.",
    subtitle: "Be thoughtful. Be credible. Bring Us More Sales.",
    label: "Bring Us More Sales",
  },
];

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function ease(value) {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function sceneAt(t) {
  const sceneDuration = durationSeconds / scenes.length;
  const index = Math.min(scenes.length - 1, Math.floor(t / sceneDuration));
  const local = (t - index * sceneDuration) / sceneDuration;
  return { scene: scenes[index], index, local: clamp(local) };
}

function drawPath(d, progress, options = {}) {
  const stroke = options.stroke ?? colors.ink;
  const strokeWidth = options.strokeWidth ?? 8;
  const opacity = options.opacity ?? 1;
  const fill = options.fill ?? "none";
  const linecap = options.linecap ?? "round";
  const linejoin = options.linejoin ?? "round";
  const dash = options.dash ?? 1000;
  const offset = dash * (1 - clamp(progress));
  return `<path d="${d}" pathLength="${dash}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="${linecap}" stroke-linejoin="${linejoin}" stroke-dasharray="${dash}" stroke-dashoffset="${offset}" opacity="${opacity}"/>`;
}

function fillPath(d, progress, options = {}) {
  const fill = options.fill ?? colors.orange;
  const opacity = (options.opacity ?? 1) * ease(progress);
  return `<path d="${d}" fill="${fill}" opacity="${opacity}"/>`;
}

function textBlock(lines, x, y, options = {}) {
  const size = options.size ?? 38;
  const weight = options.weight ?? 700;
  const fill = options.fill ?? colors.ink;
  const opacity = options.opacity ?? 1;
  const anchor = options.anchor ?? "start";
  const lineHeight = options.lineHeight ?? size * 1.18;
  return lines
    .map((line, index) => {
      const dy = index === 0 ? 0 : lineHeight;
      return `<text x="${x}" y="${y + dy}" text-anchor="${anchor}" font-family="DejaVu Sans" font-size="${size}" font-weight="${weight}" fill="${fill}" opacity="${opacity}">${esc(line)}</text>`;
    })
    .join("");
}

function roundedRect(x, y, w, h, r, progress, options = {}) {
  const d = [
    `M ${x + r} ${y}`,
    `H ${x + w - r}`,
    `Q ${x + w} ${y} ${x + w} ${y + r}`,
    `V ${y + h - r}`,
    `Q ${x + w} ${y + h} ${x + w - r} ${y + h}`,
    `H ${x + r}`,
    `Q ${x} ${y + h} ${x} ${y + h - r}`,
    `V ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
  ].join(" ");
  return drawPath(d, progress, options);
}

function circlePath(cx, cy, r) {
  return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.1} ${cy - r} Z`;
}

function stagger(local, start, end) {
  return ease((local - start) / (end - start));
}

function commonFrame(scene, index, local) {
  const titleOpacity = stagger(local, 0.45, 0.65);
  const dots = scenes
    .map((item, dotIndex) => {
      const fill = dotIndex === index ? colors.orange : "#d8c7b4";
      const r = dotIndex === index ? 7 : 5;
      return `<circle cx="${468 + dotIndex * 58}" cy="650" r="${r}" fill="${fill}" opacity="0.95"/>`;
    })
    .join("");

  return `
    <rect width="${width}" height="${height}" fill="${colors.paper}"/>
    <path d="M 0 590 C 220 540 345 646 560 600 C 805 548 1016 548 1280 604 L 1280 720 L 0 720 Z" fill="${colors.paperAlt}" opacity="0.74"/>
    <path d="M 66 88 H 1214" stroke="#eedbc7" stroke-width="2" stroke-linecap="round" stroke-dasharray="8 18" opacity="0.9"/>
    <text x="66" y="58" font-family="DejaVu Sans" font-size="22" font-weight="800" fill="${colors.orange}">TRUSTED BUMS</text>
    <text x="1214" y="58" text-anchor="end" font-family="DejaVu Sans" font-size="18" font-weight="700" fill="${colors.muted}">${esc(scene.label)}</text>
    ${textBlock([scene.title], 76, 504, { size: 43, weight: 900, opacity: titleOpacity })}
    ${textBlock(wrap(scene.subtitle, 54), 78, 552, { size: 24, weight: 600, fill: colors.muted, opacity: titleOpacity, lineHeight: 33 })}
    ${dots}
  `;
}

function wrap(copy, max) {
  const words = copy.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function sceneWelcome(local) {
  const p = stagger(local, 0.02, 0.52);
  const fill = stagger(local, 0.38, 0.55);
  return `
    ${drawPath(circlePath(640, 236, 142), p, { stroke: colors.ink, strokeWidth: 10 })}
    ${drawPath("M 586 236 L 626 278 L 704 188", stagger(local, 0.2, 0.52), { stroke: colors.green, strokeWidth: 16 })}
    ${roundedRect(498, 356, 284, 76, 22, stagger(local, 0.25, 0.54), { stroke: colors.orange, strokeWidth: 8 })}
    ${textBlock(["APPROVED"], 640, 405, { size: 34, weight: 900, fill: colors.orange, anchor: "middle", opacity: fill })}
    ${drawPath("M 465 144 L 423 103 M 813 144 L 856 103 M 454 317 L 397 342 M 830 317 L 884 342", stagger(local, 0.44, 0.72), { stroke: colors.gold, strokeWidth: 8 })}
    ${fillPath("M 638 78 L 656 116 L 699 121 L 668 151 L 676 194 L 638 173 L 600 194 L 608 151 L 577 121 L 620 116 Z", fill, { fill: colors.orange, opacity: 0.14 })}
  `;
}

function sceneNetwork(local) {
  const p = stagger(local, 0.02, 0.58);
  const q = stagger(local, 0.22, 0.7);
  const node = stagger(local, 0.32, 0.72);
  return `
    ${drawPath("M 640 252 C 548 164 418 164 338 246", p, { stroke: colors.orange, strokeWidth: 7 })}
    ${drawPath("M 640 252 C 744 158 884 180 952 275", p, { stroke: colors.orange, strokeWidth: 7 })}
    ${drawPath("M 640 252 C 594 353 482 395 360 364", p, { stroke: colors.orange, strokeWidth: 7 })}
    ${drawPath("M 640 252 C 728 363 878 386 1010 340", p, { stroke: colors.orange, strokeWidth: 7 })}
    ${drawPath(circlePath(640, 252, 58), q, { strokeWidth: 8 })}
    ${drawPath("M 606 312 C 628 338 657 338 680 312", q, { strokeWidth: 8 })}
    ${["338,246,36", "952,275,36", "360,364,36", "1010,340,36"].map((item) => {
      const [cx, cy, r] = item.split(",").map(Number);
      return `${drawPath(circlePath(cx, cy, r), node, { strokeWidth: 7 })}${fillPath(circlePath(cx, cy, r - 8), node, { fill: colors.white, opacity: 0.75 })}`;
    }).join("")}
    ${textBlock(["past colleague"], 338, 306, { size: 18, weight: 800, anchor: "middle", fill: colors.muted, opacity: node })}
    ${textBlock(["customer"], 952, 335, { size: 18, weight: 800, anchor: "middle", fill: colors.muted, opacity: node })}
    ${textBlock(["operator"], 360, 424, { size: 18, weight: 800, anchor: "middle", fill: colors.muted, opacity: node })}
    ${textBlock(["buyer"], 1010, 400, { size: 18, weight: 800, anchor: "middle", fill: colors.muted, opacity: node })}
  `;
}

function sceneTargets(local) {
  const p = stagger(local, 0.02, 0.55);
  const rows = [0.24, 0.32, 0.4, 0.48]
    .map((start, index) => {
      const y = 182 + index * 58;
      const rowP = stagger(local, start, start + 0.22);
      return `
        ${roundedRect(470, y, 340, 38, 12, rowP, { stroke: index === 1 ? colors.orange : colors.ink, strokeWidth: 6 })}
        ${drawPath(`M 502 ${y + 19} H ${735 - index * 18}`, rowP, { stroke: index === 1 ? colors.orange : colors.muted, strokeWidth: 5 })}
      `;
    })
    .join("");
  return `
    ${roundedRect(420, 118, 440, 318, 28, p, { strokeWidth: 9 })}
    ${drawPath("M 502 118 V 88 H 778 V 118", stagger(local, 0.15, 0.42), { stroke: colors.orange, strokeWidth: 8 })}
    ${textBlock(["TARGET ACCOUNTS"], 640, 156, { size: 25, weight: 900, anchor: "middle", fill: colors.orange, opacity: stagger(local, 0.28, 0.45) })}
    ${rows}
    ${drawPath("M 330 280 H 410 M 870 280 H 948", stagger(local, 0.48, 0.72), { stroke: colors.orange, strokeWidth: 8 })}
    ${drawPath(circlePath(287, 280, 38), stagger(local, 0.54, 0.78), { strokeWidth: 7 })}
    ${drawPath(circlePath(993, 280, 38), stagger(local, 0.58, 0.82), { strokeWidth: 7 })}
  `;
}

function sceneReadAhead(local) {
  const p = stagger(local, 0.02, 0.5);
  const card2 = stagger(local, 0.18, 0.56);
  const check = stagger(local, 0.5, 0.82);
  return `
    ${roundedRect(366, 126, 270, 316, 26, p, { strokeWidth: 8 })}
    ${drawPath("M 410 184 H 584 M 410 230 H 548 M 410 276 H 570 M 410 322 H 520", stagger(local, 0.2, 0.56), { stroke: colors.muted, strokeWidth: 7 })}
    ${textBlock(["READ", "AHEAD"], 500, 384, { size: 27, weight: 900, anchor: "middle", fill: colors.orange, opacity: stagger(local, 0.28, 0.56), lineHeight: 31 })}
    ${roundedRect(646, 154, 270, 250, 26, card2, { stroke: colors.orange, strokeWidth: 8 })}
    ${drawPath("M 690 214 H 858 M 690 260 H 828 M 690 306 H 840", stagger(local, 0.32, 0.66), { stroke: colors.muted, strokeWidth: 7 })}
    ${roundedRect(740, 348, 198, 72, 22, stagger(local, 0.44, 0.72), { stroke: colors.ink, strokeWidth: 8 })}
    ${textBlock(["CLAIM"], 838, 394, { size: 31, weight: 900, anchor: "middle", fill: colors.ink, opacity: stagger(local, 0.55, 0.76) })}
    ${drawPath("M 771 384 L 806 416 L 878 328", check, { stroke: colors.green, strokeWidth: 14 })}
  `;
}

function sceneIntro(local) {
  const p = stagger(local, 0.02, 0.54);
  const cal = stagger(local, 0.42, 0.82);
  return `
    ${drawPath("M 315 252 C 390 204 454 210 511 270 C 535 296 562 306 596 294", p, { strokeWidth: 10 })}
    ${drawPath("M 965 252 C 890 204 826 210 769 270 C 745 296 718 306 684 294", p, { strokeWidth: 10 })}
    ${drawPath("M 594 294 C 626 254 660 254 686 294 C 661 334 624 334 594 294 Z", stagger(local, 0.22, 0.58), { stroke: colors.orange, strokeWidth: 10 })}
    ${drawPath("M 640 171 V 96 M 604 132 H 676", stagger(local, 0.34, 0.62), { stroke: colors.gold, strokeWidth: 9 })}
    ${roundedRect(510, 346, 260, 96, 20, cal, { strokeWidth: 8 })}
    ${drawPath("M 510 378 H 770 M 562 346 V 322 M 718 346 V 322", cal, { stroke: colors.orange, strokeWidth: 7 })}
    ${textBlock(["INTRO", "BOOKED"], 640, 406, { size: 25, weight: 900, anchor: "middle", fill: colors.orange, opacity: stagger(local, 0.58, 0.82), lineHeight: 30 })}
  `;
}

function sceneOutcome(local) {
  const p = stagger(local, 0.04, 0.62);
  const labels = [
    ["Claim", 218, 300],
    ["Intro", 390, 300],
    ["Meeting", 580, 300],
    ["Revenue", 790, 300],
    ["Commission", 1016, 300],
  ];
  return `
    ${drawPath("M 278 300 H 956", p, { stroke: colors.orange, strokeWidth: 9 })}
    ${labels.map(([label, x, y], index) => {
      const nodeP = stagger(local, 0.12 + index * 0.07, 0.42 + index * 0.07);
      return `
        ${drawPath(circlePath(x, y, 48), nodeP, { strokeWidth: 8 })}
        ${textBlock([label], x, y + 88, { size: 20, weight: 900, anchor: "middle", fill: colors.muted, opacity: nodeP })}
      `;
    }).join("")}
    ${drawPath("M 974 280 C 1008 228 1078 246 1082 305 C 1086 364 1006 384 970 332", stagger(local, 0.56, 0.86), { stroke: colors.green, strokeWidth: 9 })}
    ${textBlock(["$"], 1026, 322, { size: 61, weight: 900, anchor: "middle", fill: colors.green, opacity: stagger(local, 0.62, 0.86) })}
  `;
}

function sceneFinal(local) {
  const p = stagger(local, 0.03, 0.62);
  const fill = stagger(local, 0.36, 0.72);
  return `
    ${drawPath(circlePath(382, 248, 58), p, { strokeWidth: 8 })}
    ${drawPath(circlePath(640, 218, 70), p, { stroke: colors.orange, strokeWidth: 10 })}
    ${drawPath(circlePath(898, 248, 58), p, { strokeWidth: 8 })}
    ${drawPath("M 438 248 C 510 160 576 157 640 218 C 705 157 770 160 842 248", stagger(local, 0.22, 0.62), { stroke: colors.orange, strokeWidth: 8 })}
    ${drawPath("M 420 342 C 540 410 742 410 860 342", stagger(local, 0.38, 0.75), { stroke: colors.ink, strokeWidth: 8 })}
    ${textBlock(["BRING US", "MORE SALES"], 640, 326, { size: 52, weight: 950, anchor: "middle", fill: colors.orange, opacity: fill, lineHeight: 59 })}
  `;
}

function sceneArt(index, local) {
  switch (index) {
    case 0:
      return sceneWelcome(local);
    case 1:
      return sceneNetwork(local);
    case 2:
      return sceneTargets(local);
    case 3:
      return sceneReadAhead(local);
    case 4:
      return sceneIntro(local);
    case 5:
      return sceneOutcome(local);
    default:
      return sceneFinal(local);
  }
}

function svgAtTime(t) {
  const { scene, index, local } = sceneAt(t);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${outputWidth}" height="${outputHeight}" viewBox="0 0 ${width} ${height}">
  <style>
    text { paint-order: stroke; stroke: transparent; }
  </style>
  ${commonFrame(scene, index, local)}
  ${sceneArt(index, local)}
</svg>
`;
}

function htmlDocument() {
  return "<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n    <title>Trusted Bums - Welcome Bum Line Animation</title>\n    <style>\n      html,\n      body {\n        margin: 0;\n        min-height: 100%;\n        overflow: hidden;\n        background: #08111f;\n      }\n\n      body {\n        display: grid;\n        place-items: center;\n      }\n\n      img {\n        display: block;\n        width: 960px;\n        height: 540px;\n        background: #fff8ef;\n      }\n    </style>\n  </head>\n  <body>\n    <img id=\"stage\" src=\"bum-welcome-frames/frame-0000.svg\" alt=\"Line drawing animation welcoming a new Trusted Bums connector and explaining how the portal works.\" />\n    <script>\n      const fps = 6;\n      const frameCount = 252;\n      const stage = document.getElementById(\"stage\");\n      const pad = (value) => String(value).padStart(4, \"0\");\n      let startedAt = performance.now();\n\n      function tick(now) {\n        const elapsed = (now - startedAt) / 1000;\n        const frame = Math.min(frameCount - 1, Math.floor(elapsed * fps));\n        stage.src = `bum-welcome-frames/frame-${pad(frame)}.svg`;\n\n        if (frame >= frameCount - 1) {\n          window.__trustedBumsAnimationDone = true;\n          return;\n        }\n\n        requestAnimationFrame(tick);\n      }\n\n      requestAnimationFrame(tick);\n    </script>\n  </body>\n</html>\n";
}

async function render() {
  await rm(frameDir, { recursive: true, force: true });
  await mkdir(frameDir, { recursive: true });
  await mkdir(assetDir, { recursive: true });

  for (let frame = 0; frame < frameCount; frame += 1) {
    const t = frame / fps;
    const fileName = `frame-${String(frame).padStart(4, "0")}.svg`;
    await writeFile(path.join(frameDir, fileName), svgAtTime(t));
  }

  await writeFile(posterPath, svgAtTime(0));
  await writeFile(htmlPath, htmlDocument());

  console.log(`Rendered ${frameCount} frames in ${frameDir}`);
  console.log(`Wrote ${htmlPath}`);
  console.log(`Wrote ${posterPath}`);
}

render().catch((error) => {
  console.error(error);
  process.exit(1);
});
