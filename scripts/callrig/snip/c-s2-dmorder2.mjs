export default async ({page}) => {
  await page.waitForTimeout(12000);
  const live=await page.evaluate(()=>({log:(window.__ord||[]).map(e=>`${e.t}s: ${e.v}`),
    running:!!window.__ordint}));
  await page.reload(); await page.waitForTimeout(11000);
  const after=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('a[href*="/d/"]')].filter(v)
      .sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top)
      .map(a=>(a.getAttribute('aria-label')||a.innerText||'').replace(/\s+/g,' ').trim().slice(0,26));});
  return {liveLog:live.log, orderAfterReload:after};
};
