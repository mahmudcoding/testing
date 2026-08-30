/* sector L: open a device menu and enumerate what it offers */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  const which = process.env.QA_DEV || 'camera';   // camera | microphone
  const out={which};
  out.trigger = await page.evaluate((w)=>{
    const q=window.__qa;
    const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>new RegExp('^Select '+w+'$','i').test(q.nameOf(x).trim()));
    if(!b) return {ok:false};
    const r={ok:true, expandedBefore:b.getAttribute('aria-expanded')};
    b.click(); return r;
  }, which);
  await page.waitForTimeout(1500);
  out.menu = await page.evaluate(()=>{
    const q=window.__qa;
    const wraps=[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(q.boxVis);
    return wraps.map(w=>({
      text:(w.innerText||'').replace(/\s+/g,' ').trim().slice(0,600),
      items:[...w.querySelectorAll('*')].filter(n=>!n.children.length && (n.textContent||'').trim())
        .map(n=>({t:(n.textContent||'').trim().slice(0,60)})).slice(0,30),
      checked:[...w.querySelectorAll('[aria-checked],[data-state]')].map(n=>({
        t:(n.textContent||'').trim().slice(0,50), c:n.getAttribute('aria-checked'), s:n.getAttribute('data-state')})).slice(0,20)
    }));
  });
  out.devices = await page.evaluate(async ()=>{
    const d=await navigator.mediaDevices.enumerateDevices();
    return d.map(x=>({kind:x.kind,label:x.label,id:x.deviceId.slice(0,12)}));
  });
  return out;
};
