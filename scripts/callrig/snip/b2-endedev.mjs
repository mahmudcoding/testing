export default async ({ page }) => {
  return await page.evaluate(async id => {
    const r = await fetch(`/api/v1/meeting/${id}/events?limit=100`, {credentials:'include'});
    const j = await r.json(); const arr = Array.isArray(j)?j:(j.events||j.data||j.items||[]);
    const e = arr.find(x => x.event_type === 'meeting.ended');
    return e ? { actor_user_id: e.actor_user_id, source: e.source,
                 payloadEvent: e.payload && e.payload.event } : 'no meeting.ended';
  }, process.env.QA_MEETING);
};
