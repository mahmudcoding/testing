export default async ({page}) => page.evaluate(async ()=>{
  const tag='QA-MUTEDELIV-'+Math.random().toString(36).slice(2,5);
  const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({channel_id:'C4OVEWOTJW1AA86', body:tag})});
  return {status:r.status, tag};
});
