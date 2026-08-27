export default async ({page}) => page.evaluate(async ()=>{
  const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({channel_id:'C4QCGENERAL0001', body:'QA-NM2 parent by carol',
      idempotency_key:'qnm2-'+Math.random().toString(36).slice(2)})});
  const j=await r.json().catch(()=>({}));
  return {status:r.status, id:j.id};});
