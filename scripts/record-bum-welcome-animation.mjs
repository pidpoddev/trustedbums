import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const videoDir = path.join("/tmp", "trusted-bums-bum-welcome-video");
const outputPath = path.join(root, "public", "downloads", "trusted-bums-bum-welcome-line-animation.webm");
const playerPath = path.join(root, "public", "video-assets", "trusted-bums-bum-welcome-line-animation.html");

await mkdir(videoDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 960, height: 540 },
  recordVideo: {
    dir: videoDir,
    size: { width: 960, height: 540 },
  },
});

const page = await context.newPage();
await page.goto(`file://${playerPath}`);
await page.waitForFunction(() => window.__trustedBumsAnimationDone === true, null, { timeout: 55000 });
const video = page.video();
await page.close();
await video.saveAs(outputPath);
await context.close();
await browser.close();
console.log(`Recorded ${outputPath}`);
