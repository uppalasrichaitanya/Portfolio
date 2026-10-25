// Renders a 1200×630 share card per project into public/og/<id>.jpg, from the
// same data as the site. Needs Node ≥ 22.18 (to import projects.ts) and
// Playwright with Chromium (`npx playwright install chromium`).
import { createRequire } from "node:module";
import { mkdirSync, readFileSync } from "node:fs";
import { projects } from "../src/content/projects.ts";

const { chromium } = createRequire(import.meta.url)("playwright");
const out = "public/og";
mkdirSync(out, { recursive: true });

const font = (pkg, file) => `data:font/woff2;base64,${readFileSync(`node_modules/${pkg}/files/${file}`).toString("base64")}`;
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const css = `
@font-face { font-family: Inter; font-weight: 100 900; src: url(${font("@fontsource-variable/inter", "inter-latin-wght-normal.woff2")}); }
@font-face { font-family: Code; font-weight: 100 900; src: url(${font("@fontsource-variable/jetbrains-mono", "jetbrains-mono-latin-wght-normal.woff2")}); }
@font-face { font-family: Display; src: url(${font("@fontsource/instrument-serif", "instrument-serif-latin-400-normal.woff2")}); }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: #0c0a09; color: #efe8e0; font-family: Inter; padding: 64px 80px; display: flex; flex-direction: column; overflow: hidden; position: relative; }
body::before { content: ""; position: absolute; right: -220px; top: -260px; width: 820px; height: 820px; background: radial-gradient(circle, rgb(255 138 61 / 0.22), transparent 62%); }
.top { display: flex; justify-content: space-between; font: 500 18px/1 Code; letter-spacing: 0.14em; text-transform: uppercase; color: #80776d; position: relative; }
.top b { color: #ff8a3d; font-weight: 500; }
h1 { font: 400 168px/0.86 Display; letter-spacing: -0.025em; color: #fffaf4; margin-top: 44px; position: relative; }
p { font-size: 27px; line-height: 1.32; color: #a59c92; margin-top: 26px; max-width: 920px; position: relative; }
dl { display: flex; gap: 56px; margin-top: auto; padding-top: 28px; border-top: 1px solid rgb(255 240 225 / 0.1); position: relative; }
dd { font: 400 54px/1 Display; color: #ff8a3d; }
dt { font-size: 17px; color: #80776d; margin-top: 8px; max-width: 280px; }
`;

const card = (p) => `<!doctype html><meta charset="utf-8"><style>${css}</style>
<div class="top"><span><b>${p.index}</b> · ${esc(p.kicker)}</span><span>Uppala Sri Chaitanya</span></div>
<h1>${esc(p.title)}</h1>
<p>${esc(p.oneLiner)}</p>
<dl>${p.proof.map((x) => `<div><dd>${esc(x.value)}</dd><dt>${esc(x.label)}</dt></div>`).join("")}</dl>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const p of projects) {
  await page.setContent(card(p));
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${out}/${p.id}.jpg`, type: "jpeg", quality: 88 });
  console.log(`${out}/${p.id}.jpg`);
}
await browser.close();
