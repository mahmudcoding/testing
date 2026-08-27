export default async ({page}) => {
  const secs=Number(process.env.QA_POLL_SECS||70);
  const TID=process.env.QA_TID||'call-waiting-accept-switch';
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  const t0=Date.now(); let clickedAt=null;
  while((Date.now()-t0)/1000<secs){
    const hit = await page.evaluate(({v,tid})=>{ const vis=eval(v);
      const b=[...document.querySelectorAll('[data-testid]')].filter(vis).find(e=>e.getAttribute('data-testid')===tid);
      if(b && !b.disabled){ b.click(); return true; } return false; }, {v:V, tid:TID});
    if(hit){ clickedAt=+((Date.now()-t0)/1000).toFixed(1); break; }
    await page.waitForTimeout(300);
  }
  await page.waitForTimeout(9000);
  const after = await page.evaluate((v)=>{ const vis=eval(v);
    const surf=document.querySelector('[data-testid="call-surface"]')||document.querySelector('[data-testid="pip-mini-call"]');
    return {url:location.href, inCall:!!surf,
      surface: surf?(surf.innerText||'').replace(/\n+/g,' | ').slice(0,240):null,
      toasts:[...new Set([...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert]')].filter(vis).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,90)).filter(Boolean))]}; }, V);
  return {clickedAt, after};
};
