export default async ({page}) => {
  await page.evaluate(()=>{
    const vis = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    if(dlg && /Invite to this call/.test(dlg.innerText||'')) return;
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>(x.getAttribute('aria-label')||'')==='Add to call');
    if(b) b.click();
  });
  await page.waitForTimeout(3000);
  return await page.evaluate(() => {
    const vis = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    if(!dlg) return {noDialog:true};
    const cbs=[...dlg.querySelectorAll('input[type=checkbox]')];
    return {rows: cbs.map(c=>{ let n=c; for(let i=0;i<5&&n.parentElement;i++){ n=n.parentElement; if((n.innerText||'').trim().length>4) break; }
      return {who:c.getAttribute('aria-label'), checked:c.checked, dis:c.disabled, row:(n.innerText||'').replace(/\s+/g,' ').trim().slice(0,50)}; })};
  });
};
