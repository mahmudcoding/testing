export default async ({page}) => {
  await page.waitForTimeout(10000);
  const live=await page.evaluate(()=>({log:(window.__co||[]).map(e=>`${e.t}s: ${e.v}`)}));
  await page.reload(); await page.waitForTimeout(11000);
  const after=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('a[href*="/c/"]')].filter(v)
      .sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top)
      .map(a=>(a.getAttribute('aria-label')||a.innerText||'').replace(/\s+/g,' ').trim().slice(0,28));});
  return {liveLog:live.log, orderAfterReload:after};
};
