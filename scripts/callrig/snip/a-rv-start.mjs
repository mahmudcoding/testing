import { DOM } from './lib.mjs';
const WS = 'W4QAF1XTURESO01';
export default async ({ page }) => {
  const out = {};
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4500);
  await page.evaluate(DOM);
  out.before = await page.evaluate(() => ({ url: location.pathname,
    btns: [...document.querySelectorAll('button')].filter(window.__qa.vis).map(b=>window.__qa.nameOf(b).slice(0,28)).filter(Boolean).slice(0,20) }));
  const r1 = await page.evaluate(() => window.__qa.clickDeepest(/^Start now$/));
  out.startNow = r1;
  await page.waitForTimeout(3500);
  await page.evaluate(DOM);
  out.dialog = await page.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis).pop();
    return d ? { text: d.innerText.replace(/\s+/g,' ').slice(0,300),
                 btns: [...d.querySelectorAll('button')].filter(window.__qa.vis).map(b=>window.__qa.nameOf(b).slice(0,30)) } : null;
  });
  const r2 = await page.evaluate(() => window.__qa.clickDeepest(/^(Start|Start call|Start now)$/));
  out.submit = r2;
  await page.waitForTimeout(8000);
  out.after = await page.evaluate(() => ({ url: location.pathname,
    text: (document.querySelector('main')?.innerText||document.body.innerText).replace(/\s+/g,' ').slice(0,200) }));
  return out;
};
