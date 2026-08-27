export default async ({page}) => {
  const t0=Date.now(); const rows=[]; const dur=+(process.env.QA_DUR||45000);
  while (Date.now()-t0 < dur) {
    const s = await page.evaluate(()=>{
      const vis=e=>{let a=e,op=1;while(a){const cs=getComputedStyle(a);op=Math.min(op,parseFloat(cs.opacity));if(cs.display==='none'||cs.visibility==='hidden')return false;a=a.parentElement;}return op>0.05&&e.getClientRects().length>0;};
      return {toasts:[...document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]')].filter(vis).map(e=>(e.innerText||'').replace(/\n+/g,' / ').trim().slice(0,80)).filter(Boolean)};
    });
    rows.push({ms:Date.now()-t0, ...s});
    await page.waitForTimeout(300);
  }
  const cond=[]; let prev='';
  for(const r of rows){const k=JSON.stringify(r.toasts); if(k!==prev){cond.push(r);prev=k;}}
  return {changes:cond.slice(0,25)};
};
