import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  return await page.evaluate(() => [...document.querySelectorAll('button')].filter(window.__qa.boxVis)
    .map(b=>({n:window.__qa.nameOf(b).replace(/\s+/g,' ').trim().slice(0,30), dis:b.disabled, aria:b.getAttribute('aria-disabled'), title:b.getAttribute('title'), tid:b.getAttribute('data-testid')}))
    .filter(b=>/har/i.test(b.n)||/har/i.test(b.title||'')));
};
