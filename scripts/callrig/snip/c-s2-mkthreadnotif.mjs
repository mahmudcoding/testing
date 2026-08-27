export default async ({page}) => {
  const ch='C4OX0TTLIMVOUBH';
  const parent=process.env.QA_PARENT;
  return page.evaluate(async({ch,parent})=>{
    const b={channel_id:ch, body:'QA-T4-NOTIF reply from other', idempotency_key:'qt4-'+Math.random().toString(36).slice(2)};
    if(parent) b.thread_parent_id=parent;
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify(b)});
    const j=await r.json().catch(()=>({}));
    return {status:r.status, id:j.id, parent:j.thread_parent_id};},{ch,parent});
};
