/* Leave the call WITHOUT ending the meeting, via the toolbar testid.
   Asserts the resulting state: the URL must stop matching /call/. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out = { url0: page.url() };
  await page.evaluate(DOM);
  await page.locator('[data-testid="call-controls-leave"]').click();
  await page.waitForTimeout(2200);
  out.dialog = await page.evaluate(() => {
    const q = window.__qa;
    const d = [...document.querySelectorAll('[role=dialog]')].filter(e => q.boxVis(e))
      .filter(e => e.querySelectorAll('button').length <= 8).pop();
    if (!d) return null;
    return { text: d.innerText.replace(/\n{2,}/g,'\n').slice(0,300),
             buttons: [...d.querySelectorAll('button')].filter(e=>q.vis(e))
               .map(e=>({ tid:e.getAttribute('data-testid'), l:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,30)})) };
  });
  // click the leave-only option (not "end for everyone")
  const c = await page.evaluate(() => {
    const q = window.__qa;
    const d = [...document.querySelectorAll('[role=dialog]')].filter(e => q.boxVis(e))
      .filter(e => e.querySelectorAll('button').length <= 8).pop();
    if (!d) return { ok:false, why:'no dialog' };
    const b = [...d.querySelectorAll('button')].filter(e=>q.vis(e))
      .find(e => /^Leave( call)?$/i.test((e.textContent||'').trim()));
    if (!b) return { ok:false, why:'no leave button', had: [...d.querySelectorAll('button')].map(e=>e.textContent.trim()) };
    b.click(); return { ok:true, name: b.textContent.trim() };
  });
  out.confirm = c;
  await page.waitForTimeout(4000);
  out.url1 = page.url();
  out.stillInCall = /\/call\//.test(page.url());
  out.current = await page.evaluate(async () => {
    const r = await fetch('/api/v1/meetings/current', { credentials: 'include' });
    return { s: r.status, b: (await r.text()).slice(0, 120) };
  });
  return out;
};
