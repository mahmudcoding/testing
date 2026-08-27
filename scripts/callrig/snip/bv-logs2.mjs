export default async ({page}) => {
  const out={}
  out.api = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/meeting/V4OWE208I6GA6OU/events?limit=100',{credentials:'include'})
    const j=await r.json(); const ev=j.events||[]
    const types={}; for(const e of ev) types[e.event_type]=(types[e.event_type]||0)+1
    return {total:ev.length, types,
      timeline: ev.map(e=>e.occurred_at.slice(11,19)+'  '+e.event_type+'  '+String(e.actor_user_id||'-').slice(0,20))}
  })
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/calls/V4OWE208I6GA6OU',{waitUntil:'domcontentloaded'})
  await page.waitForTimeout(7000)
  await page.evaluate(()=>{const b=[...document.querySelectorAll('[role=tab],button')].filter(x=>x.getBoundingClientRect().width>0)
    .find(x=>/^Logs/i.test((x.innerText||'').trim())); if(b) b.click()})
  await page.waitForTimeout(4000)
  out.filters = await page.evaluate(()=>[...document.querySelectorAll('button,[role=tab]')].filter(b=>b.getBoundingClientRect().width>0)
    .map(b=>(b.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>/^(All|People|Meeting|Media)\b/i.test(t)))
  out.uiEntries = await page.evaluate(()=>{
    const rows=[...document.querySelectorAll('li,[role=listitem],div')].filter(e=>{
      const t=(e.innerText||''); return /\d{1,2}:\d{2}:\d{2}\s*(AM|PM)/.test(t) && t.length<200 && e.children.length<=6})
    const seen=new Set(); const o=[]
    for(const r of rows){const t=r.innerText.replace(/\s+/g,' ').trim(); if(t&&!seen.has(t)){seen.add(t); o.push(t)}}
    return o.slice(0,40)
  })
  out.hasWords = await page.evaluate(()=>{
    const t=document.body.innerText.toLowerCase()
    return {request:t.includes('request'), admit:t.includes('admit'), deny:/\bden(y|ied)\b/.test(t), waiting:t.includes('waiting')}
  })
  return out
}
