export default async ({page}) => {
  const M=process.env.QA_MEETING;
  return await page.evaluate(async(m)=>{
    const r=await fetch(`/api/v1/meeting/${m}/events?limit=200`,{credentials:'include'});
    const j=await r.json();
    const evs=(j.events||[]);
    const counts={};
    evs.forEach(e=>{ counts[e.event_type]=(counts[e.event_type]||0)+1; });
    return {total:evs.length, counts,
      sample: evs.slice(0,8).map(e=>({t:e.event_type, actor:e.actor_user_id||null, vis:e.visibility,
                                      at:e.occurred_at, pev:(e.payload&&e.payload.event)||null}))};
  }, M);
};
