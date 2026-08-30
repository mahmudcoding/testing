import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QEF1XTURESO01/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  await page.evaluate(DOM);
  return await page.evaluate((mid)=>{
    const q=window.__qa;
    const el=document.querySelector(`[data-message-id="${mid}"]`);
    if(!el) return {found:false, ids:[...document.querySelectorAll('[data-message-id]')].map(n=>n.getAttribute('data-message-id')).slice(-4)};
    return {found:true, vis:q.boxVis(el),
      text:(el.innerText||'').replace(/\s+/g,' ').trim(),
      html:(el.innerHTML||'').replace(/\s+/g,' ').slice(0,600),
      btns:[...el.querySelectorAll('button,a')].filter(q.vis).map(n=>q.nameOf(n).slice(0,40))};
  }, process.env.QA_MSGID);
};
