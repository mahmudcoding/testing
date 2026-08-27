export default async ({page}) => {
  return await page.evaluate(async()=>{
    const tries=['/api/v1/meeting/V4OWDKLUJ7XE1PZ/logs?limit=100','/api/v1/meetings/V4OWDKLUJ7XE1PZ/logs?limit=100',
      '/api/v1/meeting/V4OWDKLUJ7XE1PZ/activity?limit=100','/api/v1/meetings/V4OWDKLUJ7XE1PZ/activity?limit=100',
      '/api/v1/meeting/V4OWDKLUJ7XE1PZ/events?limit=100']
    const out=[]
    for(const u of tries){
      try{const r=await fetch(u,{credentials:'include'})
        const txt=await r.text()
        out.push({u, status:r.status, sample:txt.slice(0,900)})
        if(r.ok) break
      }catch(e){out.push({u,err:String(e).slice(0,60)})}
    }
    return out
  })
}
