export default async ({page}) => {
  const out=[];
  const t0=Date.now();
  for (let i=0;i<20;i++){
    const s = await page.evaluate(async ()=>{
      const bar=document.querySelector('[data-testid="call-top-bar"]');
      const j = await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json();
      return {ui:(bar?bar.innerText:'').replace(/\n+/g,' ').split('|')[0].trim().slice(0,30),
              api:j.meeting?j.meeting.name:null, vis:document.visibilityState};
    });
    out.push({s:Math.round((Date.now()-t0)/1000), ...s});
    if (s.ui===s.api && i>2) break;
    await page.waitForTimeout(2000);
  }
  return out;
};
