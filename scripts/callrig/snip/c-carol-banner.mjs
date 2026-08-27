export default async ({page}) => {
  const t0=Date.now(); const rows=[];
  const act = process.env.QA_ACT || 'decline';
  let done=null;
  while (Date.now()-t0 < 22000) {
    const s = await page.evaluate(()=>{
      const vis = e => { let a=e,op=1; while(a){const cs=getComputedStyle(a); op=Math.min(op,parseFloat(cs.opacity)); if(cs.display==='none'||cs.visibility==='hidden') return false; a=a.parentElement;} return op>0.05 && e.getClientRects().length>0; };
      const cand=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"],[data-sonner-toast],[role="status"],[role="alert"]')].filter(vis);
      const texts=cand.map(e=>(e.innerText||'').replace(/\n+/g,' | ').trim().slice(0,120)).filter(t=>/calling|incoming|accept|decline/i.test(t));
      const btns=[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()).filter(l=>/accept|decline/i.test(l));
      return {texts, btns};
    });
    rows.push({ms:Date.now()-t0, ...s});
    if (s.btns.length && !done) {
      done = {at: Date.now()-t0, banner: s.texts};
      if (act==='decline') await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/decline/i.test(x.getAttribute('aria-label')||x.textContent||'')); if(b)b.click();});
      else if (act==='accept') await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/accept/i.test(x.getAttribute('aria-label')||x.textContent||'')); if(b)b.click();});
      else break;
      await page.waitForTimeout(2500);
      break;
    }
    await page.waitForTimeout(300);
  }
  const cond=[]; let prev='';
  for(const r of rows){const k=JSON.stringify([r.texts,r.btns]); if(k!==prev){cond.push(r);prev=k;}}
  return {found: done, changes: cond.slice(0,10)};
};
