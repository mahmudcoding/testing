export default async ({page}) => {
  const t0=Date.now(); const rows=[]; let clicked=null, confirmed=null;
  const snap = () => page.evaluate(()=>{
    const vis = e => { let a=e,op=1; while(a){const cs=getComputedStyle(a); op=Math.min(op,parseFloat(cs.opacity)); if(cs.display==='none'||cs.visibility==='hidden') return false; a=a.parentElement;} return op>0.05 && e.getClientRects().length>0; };
    const toasts=[...document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]')].filter(vis).map(e=>(e.innerText||'').replace(/\n+/g,' / ').trim().slice(0,90)).filter(Boolean);
    const dlg=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis).map(d=>(d.innerText||'').replace(/\n+/g,' | ').slice(0,220)).filter(t=>/leave this call|leave/i.test(t));
    return {toasts, dlg, url: location.pathname.slice(-18)};
  });
  while (Date.now()-t0 < 30000) {
    const s = await snap(); rows.push({ms:Date.now()-t0, ...s});
    if (clicked===null && Date.now()-t0 > 1200) {
      const ok = await page.evaluate(()=>{const b=[...document.querySelectorAll('button[aria-label="Leave call"]')].find(x=>x.getClientRects().length); if(!b) return false; b.click(); return true;});
      if (ok) clicked = Date.now()-t0;
    } else if (clicked!==null && confirmed===null && Date.now()-t0 > clicked+1500) {
      const ok = await page.evaluate(()=>{
        const ds=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(e=>e.getClientRects().length); const d=ds[ds.length-1];
        if(!d) return false; const b=[...d.querySelectorAll('button')].find(x=>/^leave$/i.test((x.textContent||'').trim())||/leave call/i.test((x.textContent||'').trim()));
        if(!b) return false; b.click(); return true;});
      if (ok) confirmed = Date.now()-t0;
    }
    await page.waitForTimeout(300);
  }
  const cond=[]; let prev='';
  for(const r of rows){const k=JSON.stringify([r.toasts,r.dlg,r.url]); if(k!==prev){cond.push(r);prev=k;}}
  return {clicked, confirmed, changes: cond.slice(0,20)};
};
