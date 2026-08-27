export default async ({page}) => {
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  const cur = () => page.evaluate(async()=>{
    const r=await fetch('/api/v1/meetings/current',{credentials:'include'});
    const t=await r.text();
    return {empty:t.trim()==='{}', body:t.slice(0,120)};
  });
  // leave
  await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>(x.innerText||'').trim()==='Leave call');
    if(b) b.click(); }, V);
  await page.waitForTimeout(2200);
  await page.evaluate((v)=>{ const vis=eval(v);
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    const b=dlg?[...dlg.querySelectorAll('button')].filter(vis).find(x=>(x.innerText||'').trim()==='Leave'):null;
    if(b) b.click(); }, V);
  const t0=Date.now();
  const samples=[];
  let clearedAt=null;
  while((Date.now()-t0)/1000 < Number(process.env.QA_WAIT_SECS||300)){
    const c = await cur();
    samples.push({t:+((Date.now()-t0)/1000).toFixed(1), empty:c.empty});
    if(c.empty){ clearedAt=+((Date.now()-t0)/1000).toFixed(1); break; }
    await page.waitForTimeout(3000);
  }
  return {clearedAtSecAfterLeave: clearedAt, samples: samples.slice(0,10), totalSamples: samples.length};
};
