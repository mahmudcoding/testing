export default async ({page}) => page.evaluate(async ()=>{
  const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({channel_id:'C4QCPRIVATE0001', body:'QA-2650B last '+Math.random().toString(36).slice(2,5)})});
  const j=await r.json();
  return {status:r.status, id:j.id||j.message?.id};
});
