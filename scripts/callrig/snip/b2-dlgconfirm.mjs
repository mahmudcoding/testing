export default async ({page}) => {
  const LABEL=process.env.QA_CONFIRM||'Ban';
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  const r = await page.evaluate(({v,label})=>{ const vis=eval(v);
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    if(!dlg) return {noDialog:true};
    const b=[...dlg.querySelectorAll('button')].filter(vis).find(x=>(x.innerText||'').trim()===label);
    if(b && !b.disabled){ b.click(); return {clicked:label}; }
    return {items:[...dlg.querySelectorAll('button')].filter(vis).map(x=>(x.innerText||'').trim())}; }, {v:V, label:LABEL});
  await page.waitForTimeout(6000);
  const after = await page.evaluate((v)=>{ const vis=eval(v);
    const surf=document.querySelector('[data-testid="call-surface"]');
    return {surface: surf?(surf.innerText||'').replace(/\n+/g,' | ').slice(0,240):null,
      toasts:[...new Set([...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert]')].filter(vis).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,90)).filter(Boolean))]}; }, V);
  return {r, after};
};
