export default async ({page}) => {
  const t0=Date.now(); const rows=[]; let accepted=null;
  const snap = () => page.evaluate(()=>{
    const vis = e => { let a=e,op=1; while(a){const cs=getComputedStyle(a); op=Math.min(op,parseFloat(cs.opacity)); if(cs.display==='none'||cs.visibility==='hidden') return false; a=a.parentElement;} return op>0.05 && e.getClientRects().length>0; };
    const toasts=[...document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"],li[data-testid*="toast" i]')].filter(vis)
      .map(e=>(e.innerText||'').replace(/\n+/g,' / ').trim().slice(0,90)).filter(Boolean);
    return {toasts, url:location.pathname.slice(-20)};
  });
  while (Date.now()-t0 < 40000) {
    const s = await snap(); rows.push({ms:Date.now()-t0, ...s});
    if (!accepted) {
      const ok = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/accept/i.test(x.getAttribute('aria-label')||x.textContent||'')); if(!b) return false; b.click(); return true;});
      if (ok) accepted = Date.now()-t0;
    }
    await page.waitForTimeout(300);
  }
  const cond=[]; let prev='';
  for(const r of rows){const k=JSON.stringify(r.toasts)+r.url; if(k!==prev){cond.push(r);prev=k;}}
  return {acceptedAtMs: accepted, changes: cond.slice(0,20)};
};
