import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  return await page.evaluate(() => ({
    url: location.pathname,
    title: document.title,
    text: (document.querySelector('main')?.innerText||document.body.innerText).replace(/\s+/g,' ').slice(0,400),
    btns: [...document.querySelectorAll('button')].filter(window.__qa.vis).map(b=>window.__qa.nameOf(b).replace(/\s+/g,' ').slice(0,34)).filter(Boolean),
    dialogs: [...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis).map(d=>({tid:d.getAttribute('data-testid'), t:d.innerText.replace(/\s+/g,' ').slice(0,160)})),
  }));
};
