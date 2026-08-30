/* Leave a call properly: Leave call -> confirm. Asserts the URL left /call/. */
import { DOM, safeClick, watchNotices } from './lib.mjs';
export default async ({ page }) => {
  const out={};
  await page.evaluate(DOM);
  out.before = { url: page.url(), wall: new Date().toISOString(),
    clock: await page.evaluate(()=>{
      const ov=document.querySelector('[data-testid="call-overlay-expanded"]');
      const m=(ov?ov.innerText:'').match(/\b(\d+:\d{2})\b/); return m?m[1]:null; }) };
  out.open = await safeClick(page,'[data-testid="call-controls-leave"]');
  await page.waitForTimeout(1500);
  out.confirm = await safeClick(page,'[data-testid="call-leave-confirm-submit"]');
  await page.waitForTimeout(6000);
  out.url = page.url();
  out.stillInCall = /\/call\//.test(out.url);
  await page.evaluate(DOM);
  out.screen = await page.evaluate(()=>{
    const q=window.__qa;
    const body=document.body;
    return {text:(body.innerText||'').replace(/\s+/g,' ').slice(0,1500),
      btns:[...body.querySelectorAll('button,a')].filter(q.vis).map(n=>({n:q.nameOf(n).slice(0,50),t:n.getAttribute('data-testid')})).slice(0,40)};
  });
  out.notices = await page.evaluate(()=>window.__qa.notices());
  out.wallAfter = new Date().toISOString();
  return out;
};
