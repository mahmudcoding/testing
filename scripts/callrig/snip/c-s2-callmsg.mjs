export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OX37SVWDRD28T';
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`);
  await page.waitForTimeout(6000);
  const t0=Date.now();
  let found=null; const samples=[];
  while(Date.now()-t0 < 330000){
    const s=await page.evaluate(async(dm)=>{
      const r=await fetch(`/api/v1/messaging/channels/${dm}/messages?limit=5`,{credentials:'include'});
      const j=await r.json().catch(()=>({}));
      const arr=j.messages||[];
      const call=arr.find(m=>m.call_outcome||m.call_duration_seconds!==undefined||m.meeting_id);
      return call? {id:call.id, outcome:call.call_outcome, seconds:call.call_duration_seconds,
        created_at:call.created_at, meeting:call.meeting_id} : null;}, dm);
    if(s){ found=s; break; }
    samples.push(Math.round((Date.now()-t0)/1000));
    await page.waitForTimeout(15000);
  }
  let rendered=null;
  if(found){
    await page.reload(); await page.waitForTimeout(8000);
    rendered=await page.evaluate((id)=>{
      const e=document.querySelector(`main [data-message-id="${id}"]`);
      return e? (e.innerText||'').replace(/\s+/g,' ').slice(0,70):null;}, found.id);
  }
  return {waitedSec:Math.round((Date.now()-t0)/1000), call:found, rendered};
};
