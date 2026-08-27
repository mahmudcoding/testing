export default async ({page}) => page.evaluate(async({parent})=>{
  const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({channel_id:'C4QCGENERAL0001', body:'QA-NM reply by bob',
      thread_parent_id:parent, idempotency_key:'qnm-'+Math.random().toString(36).slice(2)})});
  const j=await r.json().catch(()=>({}));
  return {status:r.status, id:j.id, parent:j.thread_parent_id};}, {parent:process.env.QA_PARENT});
