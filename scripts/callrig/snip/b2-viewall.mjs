export default async ({page}) => {
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  const clicked = await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>(x.innerText||'').replace(/\s+/g,' ').trim()==='View all');
    if(b){ b.click(); return true; } return false; }, V);
  await page.waitForTimeout(4500);
  const dlg = await page.evaluate((v)=>{ const vis=eval(v);
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    return d?(d.innerText||'').replace(/\n+/g,' | ').slice(0,400):null; }, V);
  return {clicked, dlg};
};
