export default async ({page}) => {
  const ws='W4QCF1XTURESO01', id='C4QCGENERAL0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${id}`, {waitUntil:'load'});
  await page.waitForTimeout(4000);
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  const snap = () => page.evaluate(v=>{const vv=eval(v);
    const menus=[...document.querySelectorAll('[role=menu],[role=listbox],[role=dialog],[data-radix-popper-content-wrapper]')].filter(vv);
    const b=document.querySelector('button[aria-label="Mute notifications"],button[aria-label="Unmute notifications"]');
    return {menus:menus.map(m=>m.innerText.replace(/\s+/g,' ').slice(0,160)),
      btn:b?{l:b.getAttribute('aria-label'),p:b.getAttribute('aria-pressed'),dis:b.disabled}:null,
      toasts:[...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vv).map(t=>t.innerText.replace(/\s+/g,' ').trim().slice(0,90)).filter(Boolean)};}, V);
  const before = await snap();
  const errs=[]; page.on('console', m=>{if(m.type()==='error') errs.push(m.text().slice(0,140));});
  const reqs=[]; page.on('response', r=>{const u=r.url(); if(/\/api\/v1\//.test(u) && r.request().method()!=='GET') reqs.push(r.request().method()+' '+u.replace(/^https?:\/\/[^/]+/,'')+' → '+r.status());});
  await page.locator('button[aria-label="Mute notifications"]').first().click();
  const series=[]; for(let i=0;i<12;i++){ await page.waitForTimeout(300); series.push(await snap()); }
  const uniq=[]; for(const s of series){const k=JSON.stringify(s); if(!uniq.length||JSON.stringify(uniq[uniq.length-1])!==k) uniq.push(s);}
  return {before, after: uniq, apiWrites: reqs, consoleErrors: errs.slice(0,4)};
};
