import { DOM } from './lib.mjs';
const WS = 'W4QAF1XTURESO01';
export default async ({ page }) => {
  const id = process.env.QA_CALL;
  const out = { id };
  await page.goto(`https://airion-cargo.store/w/${WS}/call/${id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  await page.evaluate(DOM);
  out.landing = await page.evaluate(() => ({ url: location.pathname,
    text: (document.body.innerText||'').replace(/\s+/g,' ').slice(0,240),
    btns: [...document.querySelectorAll('button')].filter(window.__qa.vis).map(b=>window.__qa.nameOf(b).replace(/\s+/g,' ').slice(0,30)).filter(Boolean) }));
  for (const label of [/^Join now$/, /^Join call$/, /^Join$/, /^Ask to join$/]) {
    const r = await page.evaluate((src) => window.__qa.clickDeepest(new RegExp(src)), label.source);
    if (r.ok) { out.clicked = r.name; break; }
  }
  await page.waitForTimeout(7000);
  await page.evaluate(DOM);
  out.after = await page.evaluate(() => ({ url: location.pathname,
    text: (document.body.innerText||'').replace(/\s+/g,' ').slice(0,240),
    btns: [...document.querySelectorAll('button')].filter(window.__qa.vis).map(b=>window.__qa.nameOf(b).replace(/\s+/g,' ').slice(0,30)).filter(Boolean) }));
  return out;
};
