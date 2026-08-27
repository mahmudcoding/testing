export default async ({page}) => {
  const M = process.env.QA_MEETING;
  return await page.evaluate(async(m)=>{
    const r = await fetch(`/api/v1/meeting/${m}/events?limit=100`, {credentials:'include'});
    const j = await r.json();
    const evs = (j.events||[]);
    const ended = evs.filter(e=>/ended|finish/i.test(e.event_type)||/room_finished/.test(JSON.stringify(e.payload||{})));
    return {status:r.status, total:evs.length,
      types: [...new Set(evs.map(e=>e.event_type))],
      ended: ended.map(e=>({event_type:e.event_type, source:e.source, actor:e.actor_user_id??null,
        visibility:e.visibility, occurred_at:e.occurred_at, pev:(e.payload&&e.payload.event)||null}))};
  }, M);
};
