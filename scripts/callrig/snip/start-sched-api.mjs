export default async ({page}) => await page.evaluate(async(sid)=>{
  const r = await fetch(`/api/v1/calendar/meetings/${sid}/start`,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:'{}'});
  const j = await r.json();
  return {status:r.status, meeting_id:j.meeting_id, meeting_status:j.meeting_status};
}, process.env.QA_SID);
