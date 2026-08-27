export default async ({page}) => {
  return await page.evaluate(async()=>{
    const r=await fetch('/api/v1/meeting/V4OWDKLUJ7XE1PZ/events?limit=100',{credentials:'include'})
    const j=await r.json()
    const ev=(j.events||[])
    const types={}
    for(const e of ev) types[e.event_type]=(types[e.event_type]||0)+1
    return {total:ev.length, types,
      timeline: ev.map(e=>e.occurred_at.slice(11,19)+' '+e.event_type+' '+String(e.actor_user_id||'-').slice(0,22)+' vis='+e.visibility)}
  })
}
