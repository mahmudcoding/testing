export default async ({page}) => page.evaluate(async ()=>{
  const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({channel_id:'C4OVEWOTJW1AA86', body:'QA-DMORDER ping '+Math.random().toString(36).slice(2,5)})});
  return {status:r.status};
});
