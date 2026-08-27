export default async ({page}) => {
  return await page.evaluate(async()=>{
    const r=await fetch('/api/v1/meeting/V4OWDKLUJ7XE1PZ/events?limit=100',{credentials:'include'})
    const j=await r.json()
    const ev=(j.events||[])
    const types={}
    for(const e of ev) types[e.event_type]=(types[e.event_type]||0)+1
    const interesting = ev.filter(e=>!/^track\.|^participant\.(joined|left)$|^room\./.test(e.event_type))
      .map(e=>({t:e.occurred_at.slice(11,19), type:e.event_type, actor:String(e.actor_user_id||'').slice(0,20),
        vis:e.visibility, payloadKeys:Object.keys(e.payload||{}).slice(0,8),
        payload:JSON.stringify(e.payload||{}).slice(0,220)}))
    return {total:ev.length, types, interesting}
  })
}
