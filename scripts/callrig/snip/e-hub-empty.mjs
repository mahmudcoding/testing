import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QEF1XTURESO01/calls', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.evaluate(DOM);
  return await page.evaluate(() => {
    const q = window.__qa;
    const main = document.querySelector('main') || document.body;
    const ctrls = [...main.querySelectorAll('button,a,[role=tab],input,[role=button]')]
      .filter(n => q.vis(n))
      .map(n => ({ n: q.nameOf(n).slice(0,80), t: n.getAttribute('data-testid')||null,
                   dis: n.disabled === true || n.getAttribute('aria-disabled')==='true',
                   sel: n.getAttribute('aria-selected')||null }));
    return { url: location.href, text: (main.innerText||'').replace(/\s+/g,' ').trim().slice(0,900), ctrls, n: ctrls.length };
  });
};
