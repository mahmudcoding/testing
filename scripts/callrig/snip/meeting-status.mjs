export default async ({page}) => await page.evaluate(async(mid)=>{
  const r = await fetch(`/api/v1/meeting/${mid}`,{credentials:'include'});
  const j = await r.json();
  return j.meeting? {id:j.meeting.id, name:j.meeting.name, status:j.meeting.status, ended_at:j.meeting.ended_at||null} : {status:r.status, j};
}, process.env.QA_MID);
