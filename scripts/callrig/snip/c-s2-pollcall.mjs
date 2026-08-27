// read-only: no navigation, safe to run against a page sitting in a call
export default async ({page}) => {
  const dm='C4OX37SVWDRD28T';
  const t0=Date.now(); let found=null;
  while(Date.now()-t0 < 400000){
    const s=await page.evaluate(async(dm)=>{
      const r=await fetch(`/api/v1/messaging/channels/${dm}/messages?limit=3`,{credentials:'include'});
      const j=await r.json().catch(()=>({}));
      const m=(j.messages||[])[0];
      return m && (m.call_outcome||m.meeting_id)
        ? {outcome:m.call_outcome, seconds:m.call_duration_seconds, created_at:m.created_at,
           meeting:m.meeting_id, seq:m.channel_seq} : null;}, dm);
    if(s && s.meeting==='V4OX611AZAAKYIS') { found=s; break; }
    if(s && s.seq>=257){ found=s; break; }
    await page.waitForTimeout(15000);
  }
  return {waitedSec:Math.round((Date.now()-t0)/1000), message:found,
    stillInCall:/\/call\//.test(page.url())};
};
