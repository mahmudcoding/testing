export default async ({ page }) => {
  const mid=process.env.QA_MID;
  return await page.evaluate(async (m)=>{
    const r=await fetch(`/api/v1/meeting/${m}/events?limit=200`,{credentials:'include'});
    const j=await r.json();
    return (j.events||[]).filter(e=>/^(participant\.|meeting\.|recording\.)/.test(e.event_type))
      .map(e=>`${e.occurred_at} ${e.event_type} actor=${(e.actor_user_id||'-').slice(-8)} vis=${e.visibility} src=${e.source}`);
  }, mid);
};
