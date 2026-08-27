export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(12000);
  const order=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('a[href*="/d/"]')].filter(v)
      .sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top)
      .map(a=>({who:(a.getAttribute('aria-label')||a.innerText||'').replace(/\s+/g,' ').trim().slice(0,26),
                id:(a.getAttribute('href')||'').split('/d/')[1],
                y:Math.round(a.getBoundingClientRect().top)}));});
  const before=await order();
  // install a poller so we see the change live, from before the trigger
  await page.evaluate(()=>{
    const grab=()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      return [...document.querySelectorAll('a[href*="/d/"]')].filter(v)
        .sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top)
        .map(a=>(a.getAttribute('aria-label')||a.innerText||'').replace(/\s+/g,' ').trim().slice(0,20)).join(' | ');};
    window.__ord=[{t:0,v:grab()}]; const t0=Date.now();
    clearInterval(window.__ordint);
    window.__ordint=setInterval(()=>{const v=grab(),L=window.__ord;
      if(L[L.length-1].v!==v) L.push({t:Math.round((Date.now()-t0)/1000),v});
      if(L.length>25) clearInterval(window.__ordint);},300);});
  return {sidebarDMOrderBefore:before.map(x=>x.who)};
};
