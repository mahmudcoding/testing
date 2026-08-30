import { DOM } from './lib.mjs';
export default async ({page}) => {
  await page.evaluate(DOM);
  return await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button,a[href],[role=button]')]
      .filter(b => window.__qa.vis(b) || window.__qa.boxVis(b))
      .map(b => ({ t: (b.getAttribute('aria-label') || b.textContent || '').replace(/\s+/g,' ').trim().slice(0,50),
                   d: b.disabled || b.getAttribute('aria-disabled') === 'true' }));
    return { url: location.pathname + location.search, vis: document.visibilityState,
             w: innerWidth, h: innerHeight,
             text: (document.body.innerText||'').replace(/\s+/g,' ').slice(0, 1200),
             buttons: btns };
  });
};
