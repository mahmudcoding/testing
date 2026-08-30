/* Host: open Add to call and read the guest link out of the dialog. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out = {};
  await page.evaluate(DOM);
  const b = page.locator('[data-testid="call-controls-add-to-call"]');
  out.btnCount = await b.count();
  if (!out.btnCount) {
    out.toolbar = await page.evaluate(() => {
      const q = window.__qa;
      return [...document.querySelectorAll('button')].filter(e=>q.vis(e))
        .map(e=>e.getAttribute('data-testid')).filter(Boolean);
    });
    return out;
  }
  await b.click();
  await page.waitForTimeout(2500);
  out.dialog = await page.evaluate(() => {
    const q = window.__qa;
    const dlgs = [...document.querySelectorAll('[role=dialog]')].filter(e=>q.boxVis(e))
      .filter(e => e.querySelectorAll('button').length <= 20);
    const d = dlgs[dlgs.length-1];
    if (!d) return null;
    return { text: d.innerText.replace(/\n{2,}/g,'\n').slice(0, 700),
             inputs: [...d.querySelectorAll('input,textarea')].filter(e=>q.vis(e))
               .map(e=>({ v: String(e.value).slice(0,160), ro: e.readOnly, ph: e.getAttribute('placeholder') })),
             buttons: [...d.querySelectorAll('button')].filter(e=>q.vis(e))
               .map(e=>({ tid:e.getAttribute('data-testid'), l:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,35) })),
             links: [...d.querySelectorAll('a[href]')].map(e=>e.href) };
  });
  // whole-document scan for a guest URL, in case it is not in an input
  out.guestUrlOnPage = await page.evaluate(() => {
    const m = document.body.innerText.match(/https?:\/\/[^\s"']*guest[^\s"']*/i);
    return m ? m[0] : null;
  });
  return out;
};
