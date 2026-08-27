export default async ({page}) => {
  const t0=Date.now(), seen=[];
  while (Date.now()-t0 < Number(process.env.QA_MAX||20000)) {
    const s = await page.evaluate(()=>
      [...document.querySelectorAll('[data-testid="participant-reaction-burst"],[data-testid*="reaction"]')]
        .map(e=>({tid:e.getAttribute('data-testid'), txt:(e.innerText||'').trim().slice(0,8)}))
        .filter(x=>x.txt));
    for(const x of s){ const k=x.tid+':'+x.txt; if(!seen.some(y=>y.k===k)) seen.push({k, at:((Date.now()-t0)/1000).toFixed(1)+'s', ...x}); }
    await page.waitForTimeout(300);
  }
  return {seen: seen.slice(0,6)};
};
