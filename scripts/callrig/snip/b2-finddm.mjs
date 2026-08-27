export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/chat/saved`, {waitUntil:'domcontentloaded'}).catch(()=>{});
  await page.waitForTimeout(3500);
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  const dms = await page.evaluate((v)=>{ const vis=eval(v);
    const links=[...document.querySelectorAll('a[href*="/d/"],button')].filter(vis)
      .map(e=>({t:(e.getAttribute('aria-label')||e.innerText||'').replace(/\s+/g,' ').trim().slice(0,30), href:e.getAttribute('href')}))
      .filter(x=>x.href && /\/d\//.test(x.href));
    return links.slice(0,8); }, V);
  return {dms};
};
