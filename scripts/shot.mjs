/**
 * QA visual: screenshots em vários viewports e posições de scroll.
 *   node scripts/shot.mjs <outDir> [viewports=390x844,1440x900] [scrolls=0,0.5vh,...] [url]
 * scrolls aceitam px ou múltiplos de viewport ("1.2vh").
 * Usa o Edge/Chrome instalado (playwright-core, sem download de browser).
 */
import { chromium } from "playwright-core";

const [, , out = "shots", vps = "390x844,1440x900", scrolls = "0", url = "http://localhost:3000"] = process.argv;

const browser = await chromium.launch({ channel: "msedge" }).catch(() => chromium.launch({ channel: "chrome" }));
const errors = [];
for (const vp of vps.split(",")) {
  const [w, h] = vp.split("x").map(Number);
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: w < 800, isMobile: w < 800 });
  page.on("pageerror", (e) => errors.push(`${vp}: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && errors.push(`${vp} console: ${m.text()}`));
  if (process.env.REDUCED) await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(2600);
  for (const s of scrolls.split(",")) {
    const y = s.endsWith("vh") ? Math.round(parseFloat(s) * h) : Number(s);
    await page.evaluate((y) => {
      const l = window.__lenis;
      if (l) l.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo(0, y);
    }, y);
    await page.waitForTimeout(1300);
    const ov = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (ov > 0) errors.push(`${vp} @${s}: overflow-x ${ov}px`);
    await page.screenshot({ path: `${out}/${w}x${h}_${s}.png` });
  }
  await page.close();
}
await browser.close();
console.log(errors.length ? errors.join("\n") : "no errors");
