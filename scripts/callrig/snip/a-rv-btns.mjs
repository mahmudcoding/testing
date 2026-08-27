import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  return await page.evaluate(() => ({
    url: location.pathname,
    btns: [...document.querySelectorAll('button,a[href],[role=button]')].filter(window.__qa.vis)
      .map(b=>window.__qa.nameOf(b).replace(/\s+/g,' ').slice(0,44)).filter(Boolean),
    asides: [...document.querySelectorAll('aside')].filter(window.__qa.boxVis).map(a=>a.innerText.replace(/\s+/g,' ').slice(0,300)),
  }));
};
