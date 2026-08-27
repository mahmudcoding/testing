export default async ({page}) => {
  const t0=Date.now(); const samples=[]; let clearedAt=null;
  while((Date.now()-t0)/1000 < Number(process.env.QA_WAIT_SECS||180)){
    const s = await page.evaluate(async()=>{
      const r=await fetch('/api/v1/meetings/current',{credentials:'include'});
      const t=await r.text();
      const surf=document.querySelector('[data-testid="call-surface"]');
      const ended=!!document.querySelector('[data-testid="call-ended-overlay"]');
      return {empty:t.trim()==='{}', inCall:!!surf, ended};
    }).catch(e=>({err:1}));
    samples.push({t:+((Date.now()-t0)/1000).toFixed(1), ...s});
    if(s.empty){ clearedAt=+((Date.now()-t0)/1000).toFixed(1); break; }
    await page.waitForTimeout(2000);
  }
  const firstEnded = samples.find(s=>s.ended);
  return {clearedAtSec: clearedAt, endedOverlayAtSec: firstEnded?firstEnded.t:null,
          samples: samples.slice(0,6), total: samples.length};
};
