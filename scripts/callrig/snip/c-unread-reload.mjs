// Alice sits in qa-private (NOT visiting qa-general). Watch 40s, then reload in place and re-check.
export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const read = () => page.evaluate(()=>{
    const vis = e => {const r=e.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const a=[...document.querySelectorAll('a[href*="/c/"]')].filter(vis).find(x=>/qa-general/.test(x.innerText));
    return a?(a.getAttribute('aria-label')||a.innerText.replace(/\s+/g,' ').trim()):'ABSENT';});
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCPRIVATE0001`,{waitUntil:'load'});
  await page.waitForTimeout(3500);
  const atStart = await read();
  const t0=Date.now(); const seen=[];
  let prev=null;
  for(let i=0;i<130;i++){ await page.waitForTimeout(300); const v=await read();
    if(v!==prev){ seen.push({t:Date.now()-t0, v}); prev=v; } }
  const beforeReload = await read();
  await page.reload({waitUntil:'load'}); await page.waitForTimeout(4500);
  const afterReload = await read();
  return {atStart, changesDuringWatch: seen, beforeReload, afterReload, stillOn:await page.evaluate(()=>location.pathname)};
};
