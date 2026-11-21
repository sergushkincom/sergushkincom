// Records the six gallery clips and writes assets/gifs/<name>.gif.
//
//   npm install --prefix /tmp/giftools playwright
//   NODE_PATH=/tmp/giftools/node_modules node scripts/record-gifs.mjs
//   node scripts/record-gifs.mjs world-parts
//
// Needs Chrome, ffmpeg, and gifsicle. See docs/PROJECT.md.

import { chromium } from "playwright";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const gifDir = path.join(root, "assets/gifs");

const jobs = {
  "world-parts": { viewport: { width: 960, height: 480 }, dither: "bayer", run: worldParts },
  "agentic-ui": { viewport: { width: 960, height: 560 }, dither: "none", run: agenticUi },
  "redline-supply": { viewport: { width: 1280, height: 640 }, dither: "none", run: redline },
  "battery-because": { viewport: { width: 960, height: 480 }, dither: "none", run: because },
  "workflow-canvas": { viewport: { width: 960, height: 480 }, dither: "none", run: workflow },
  "knowledge-atlas": { viewport: { width: 960, height: 480 }, dither: "bayer", run: atlas },
};

const asked = process.argv.slice(2);
const names = asked.length ? asked : Object.keys(jobs);
for (const name of names) {
  if (!jobs[name]) {
    console.error("Unknown clip:", name);
    console.error("Known:", Object.keys(jobs).join(", "));
    process.exit(1);
  }
}

const browser = await chromium.launch({
  headless: false,
  channel: "chrome",
  args: ["--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist"],
});

for (const name of names) {
  const job = jobs[name];
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `gif-${name}-`));
  const context = await browser.newContext({
    viewport: job.viewport,
    colorScheme: "light",
    deviceScaleFactor: 1,
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    const style = document.createElement("style");
    style.textContent = "*::-webkit-scrollbar{width:0;height:0} html{scrollbar-width:none}";
    document.addEventListener("DOMContentLoaded", () => document.documentElement.appendChild(style));
  });
  console.log("\n" + name);
  try {
    const timing = await job.run(page, dir);
    const dest = path.join(gifDir, `${name}.gif`);
    encode(dir, dest, timing, job.dither);
    const bytes = fs.statSync(dest).size;
    console.log(`${name} ${(bytes / 1024).toFixed(0)} KB, ${timing.frames} frames, ${(timing.ms / 1000).toFixed(1)}s capture`);
    if (bytes > 3 * 1024 * 1024) console.log("  over 3 MB, encode smaller before committing");
  } catch (err) {
    console.log("FAILED", name, err.message.split("\n")[0]);
    console.log("  leave the old clip in place if this take looks broken");
  }
  await context.close();
}

await browser.close();

function encode(dir, dest, timing, dither) {
  const frames = fs.readdirSync(dir).filter((f) => f.endsWith(".jpg")).length;
  const fps = Math.max(4, Math.min(20, Math.round(frames / (timing.ms / 1000))));
  const pal = path.join(dir, "pal.png");
  const raw = path.join(dir, "raw.gif");
  const scale = "fps=8,scale=800:-1:flags=lanczos";
  const use = dither === "none"
    ? "paletteuse=dither=none:diff_mode=rectangle"
    : "paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle";
  run("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(fps), "-i", path.join(dir, "%03d.jpg"),
    "-vf", `${scale},palettegen=stats_mode=diff:max_colors=96`, pal]);
  run("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(fps), "-i", path.join(dir, "%03d.jpg"), "-i", pal,
    "-lavfi", `${scale}[x];[x][1:v]${use}`, "-loop", "0", raw]);
  run("gifsicle", ["-O3", "--colors", "96", "-o", dest, raw]);
}

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: "inherit" });
  if (result.status !== 0) throw new Error(`${cmd} exited ${result.status}`);
}

async function shoot(page, dir, ms) {
  fs.mkdirSync(dir, { recursive: true });
  const client = await page.context().newCDPSession(page);
  let i = 0;
  let chain = Promise.resolve();
  client.on("Page.screencastFrame", (frame) => {
    const n = i++;
    const file = path.join(dir, String(n).padStart(3, "0") + ".jpg");
    chain = chain.then(async () => {
      fs.writeFileSync(file, Buffer.from(frame.data, "base64"));
      await client.send("Page.screencastFrameAck", { sessionId: frame.sessionId }).catch(() => {});
    });
  });
  const started = Date.now();
  await client.send("Page.startScreencast", {
    format: "jpeg",
    quality: 72,
    maxWidth: 960,
    maxHeight: 560,
    everyNthFrame: 2,
  });
  await page.waitForTimeout(ms);
  await client.send("Page.stopScreencast").catch(() => {});
  await chain;
  return { frames: i, ms: Date.now() - started };
}

async function worldParts(page, dir) {
  await page.goto("https://world-parts.vercel.app/?room=storeroom&object=rack&part=BRG-6305", {
    waitUntil: "domcontentloaded",
    timeout: 45000,
  });
  await page.waitForSelector('img[src*="/rooms/"]', { timeout: 15000 });
  await page.waitForTimeout(700);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Collapse panel" }).click().catch(() => {});
  await page.waitForTimeout(300);
  const pending = shoot(page, dir, 4500);
  await page.waitForTimeout(800);
  await page.getByRole("button", { name: /Corridor/ }).click();
  return pending;
}

async function agenticUi(page, dir) {
  await page.goto("https://agentic-ui-docs.vercel.app/examples/agent-run", {
    waitUntil: "domcontentloaded",
    timeout: 45000,
  });
  await page.getByRole("heading", { name: "One agent run" }).waitFor();
  await page.getByRole("button", { name: "Restart" }).click();
  await page.waitForTimeout(200);
  await page.evaluate(() => {
    const el = [...document.querySelectorAll("p")].find((n) => /agent is/i.test(n.innerText) && n.innerText.length < 160);
    if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 8);
  });
  return shoot(page, dir, 4600);
}

async function redline(page, dir) {
  await page.goto("https://redline-supply-seven.vercel.app/requests/cmp_rohs/review", {
    waitUntil: "domcontentloaded",
    timeout: 45000,
  });
  await page.getByRole("button", { name: "Approve all" }).first().waitFor();
  await page.waitForTimeout(500);
  const boxes = await page.evaluate(() =>
    [...document.querySelectorAll("button")]
      .filter((b) => (b.getAttribute("aria-label") || "").trim() === "Approve")
      .map((b) => {
        const r = b.getBoundingClientRect();
        return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2), top: r.top };
      })
      .filter((b) => b.top > 140 && b.top < 600),
  );
  // Screenshot loop. A Playwright click() scrolls this table and cuts the labels off.
  fs.mkdirSync(dir, { recursive: true });
  const started = Date.now();
  let i = 0;
  const pending = (async () => {
    while (Date.now() - started < 4200) {
      const t = Date.now();
      await page.screenshot({ path: path.join(dir, String(i).padStart(3, "0") + ".jpg"), type: "jpeg", quality: 72 });
      i++;
      const left = 140 - (Date.now() - t);
      if (left > 0) await page.waitForTimeout(left);
    }
    return { frames: i, ms: Date.now() - started };
  })();
  await page.waitForTimeout(700);
  if (boxes[2]) await page.mouse.click(boxes[2].x, boxes[2].y);
  return pending;
}

async function because(page, dir) {
  await page.goto(
    "https://battery-because.vercel.app/assets/lechfeld-1/why?role=owner&portfolio=kestrel&period=7d&loc=en-GB&date=2026-11-18",
    { waitUntil: "domcontentloaded", timeout: 45000 },
  );
  await page.getByRole("heading", { name: /Why revenue changed/i }).waitFor();
  await page.evaluate(() => {
    const el = [...document.querySelectorAll("h2, h3, div, p")].find((n) => (n.innerText || "").trim() === "Revenue bridge");
    if (el) el.scrollIntoView({ block: "start" });
    window.scrollBy(0, -8);
  });
  return shoot(page, dir, 4200);
}

async function workflow(page, dir) {
  await page.goto("https://denys-workflow-canvas.vercel.app/experiments/workflow-canvas", {
    waitUntil: "domcontentloaded",
    timeout: 45000,
  });
  await page.getByRole("button", { name: /Edit this template/i }).click();
  await page.waitForTimeout(600);
  const pending = shoot(page, dir, 5200);
  await page.waitForTimeout(250);
  await page.getByRole("button", { name: /Test run/i }).click();
  return pending;
}

async function atlas(page, dir) {
  await page.goto("https://denys-knowledge-atlas.vercel.app/", {
    waitUntil: "domcontentloaded",
    timeout: 45000,
  });
  await page.waitForSelector("canvas", { timeout: 15000 });
  await page.waitForTimeout(1000);
  const pending = shoot(page, dir, 4500);
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => /Re-sort/i.test(b.innerText || ""));
    btn?.click();
  });
  return pending;
}
