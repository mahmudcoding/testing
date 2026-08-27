export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  // observer parks in a DM so both channels are inactive; qa-general must be on top first
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(11000);
  await page.goto(`https://airion-cargo.store/w/${ws}/d/C4OWSYMJ03CFIKL`);
  await page.waitForTimeout(11000);
  const grab=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('a[href*="/c/"]')].filter(v)
      .sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top)
      .map(a=>(a.getAttribute('aria-label')||a.innerText||'').replace(/\s+/g,' ').trim().slice(0,26));});
  await page.evaluate(()=>{
    const g=()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      return [...document.querySelectorAll('a[href*="/c/"]')].filter(v)
        .sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top)
        .map(a=>(a.getAttribute('aria-label')||a.innerText||'').replace(/\s+/g,' ').trim().slice(0,22)).join(' | ');};
    window.__k=[{t:0,v:g()}]; const t0=Date.now();
    clearInterval(window.__kint);
    window.__kint=setInterval(()=>{const v=g(),L=window.__k;
      if(L[L.length-1].v!==v) L.push({t:Math.round((Date.now()-t0)/1000),v});
      if(L.length>30) clearInterval(window.__kint);},300);});
  return {start:await grab()};
};
