export default async ({ page }) => {
  const id = process.env.QA_MEETING;
  const r = await page.evaluate(async (id) => {
    const res = await fetch(`/api/v1/meeting/${id}/events?limit=200`, {credentials:'include'});
    return await res.text();
  }, id);
  const j = JSON.parse(r);
  const arr = Array.isArray(j) ? j : (j.events || j.data || j.items || []);
  const tz = t => { const d = new Date(t); d.setUTCHours(d.getUTCHours()+5);
                    return d.toISOString().slice(11,19); };
  return arr.filter(e => /participant\.(joined|left)/.test(e.event_type))
    .map(e => ({ t: tz(e.occurred_at), ev: e.event_type.replace('participant.',''),
                 who: e.payload?.participant?.name || e.actor_user_id,
                 inRoom: e.payload?.room?.num_participants }))
    .sort((a,b) => a.t < b.t ? -1 : 1);
};
