export default async ({page}) => await page.evaluate(async(mid)=>{
  const r = await fetch(`/api/v1/meeting/${mid}/events?limit=50`,{credentials:'include'});
  if (r.status!==200) return {status:r.status, body:(await r.text()).slice(0,150)};
  const j = await r.json();
  const ev = j.events||[];
  return {status:200, count: ev.length,
          types:[...new Set(ev.map(e=>e.event_type))].slice(0,12),
          visibilities:[...new Set(ev.map(e=>e.visibility))],
          actors:[...new Set(ev.map(e=>e.actor_user_id).filter(Boolean))],
          sample: ev.slice(0,2)};
}, process.env.QA_MID);
