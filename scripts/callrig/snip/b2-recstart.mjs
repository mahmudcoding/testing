export default async ({page}) => {
  const IDX = Number(process.env.QA_OPT ?? 2); // 0=everyone, 1=joined, 2=private
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  const picked = await page.evaluate(({v,idx})=>{ const vis=eval(v);
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    if(!dlg) return {noDialog:true};
    const rs=[...dlg.querySelectorAll('input')].filter(vis);
    if(!rs[idx]) return {noOption:rs.length};
    rs[idx].click();
    // report which label the chosen input belongs to
    let n=rs[idx], label='';
    for(let i=0;i<5&&n.parentElement;i++){ n=n.parentElement; const t=(n.innerText||'').trim(); if(t.length>8){ label=t.replace(/\s+/g,' ').slice(0,80); break; } }
    return {idx, checked:rs[idx].checked, label, total:rs.length};
  }, {v:V, idx:IDX});
  await page.waitForTimeout(800);
  const started = await page.evaluate((v)=>{ const vis=eval(v);
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    const b=[...dlg.querySelectorAll('button')].filter(vis).find(x=>/start recording/i.test((x.innerText||'').trim()));
    if(b && !b.disabled){ b.click(); return true; } return false; }, V);
  await page.waitForTimeout(7000);
  const after = await page.evaluate((v)=>{ const vis=eval(v);
    const ids=[...new Set([...document.querySelectorAll('[data-testid]')].filter(vis).map(e=>e.getAttribute('data-testid')))].filter(t=>/record/i.test(t));
    return {recIds:ids, toasts:[...new Set([...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert]')].filter(vis).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,90)).filter(Boolean))]}; }, V);
  return {picked, started, after};
};
