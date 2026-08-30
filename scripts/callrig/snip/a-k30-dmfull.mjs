import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const ws = 'W4QAF1XTURESO01';
  const dm = process.env.K30_DM;
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`, { waitUntil:'commit', timeout:90000 });
  await page.waitForTimeout(12000);
  await page.evaluate(DOM);
  return await page.evaluate(() => {
    const q = window.__qa;
    const main = document.querySelector('main') || document.body;
    return {
      url: location.pathname,
      loaded: /QA Bob/.test(document.body.innerText),
      mainControls: [...main.querySelectorAll('button,[role=button],a[href]')].filter(e=>q.vis(e))
        .map(e=>({ tid:e.getAttribute('data-testid'),
                   l:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,40),
                   y:Math.round(e.getBoundingClientRect().y) }))
        .filter(x=>x.l||x.tid),
      headerText: (()=>{ const h=main.querySelector('header'); return h?h.innerText.replace(/\n/g,' | ').slice(0,200):null; })(),
    };
  });
};
