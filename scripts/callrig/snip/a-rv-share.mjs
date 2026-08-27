import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out = {};
  await page.keyboard.press('Escape').catch(()=>{}); await page.waitForTimeout(500);
  await page.evaluate(DOM);
  out.before = await page.evaluate(() => [...document.querySelectorAll('button')].filter(window.__qa.vis)
    .map(b=>({n:window.__qa.nameOf(b).replace(/\s+/g,' ').trim().slice(0,30), dis:b.disabled, title:b.getAttribute('title')}))
    .filter(b=>/[Ss]har/.test(b.n)));
  const r = await page.evaluate(() => window.__qa.clickDeepest(/^Share screen$/));
  out.clicked = r;
  await page.waitForTimeout(7000);
  await page.evaluate(DOM);
  out.after = await page.evaluate(() => ({
    btns: [...document.querySelectorAll('button')].filter(window.__qa.vis)
      .map(b=>({n:window.__qa.nameOf(b).replace(/\s+/g,' ').trim().slice(0,30), dis:b.disabled, title:b.getAttribute('title')}))
      .filter(b=>/[Ss]har/.test(b.n)),
    gdm: (window.__gdmCalls||[]).length,
    dialogs: [...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis)
      .filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded').map(d=>d.innerText.replace(/\s+/g,' ').slice(0,160)),
  }));
  return out;
};
