export default async ({page}) => {
  const ch='C4OX0TTLIMVOUBH';
  const parent=process.env.QA_PARENT, txt=process.env.QA_MSG||'reply';
  return page.evaluate(async({ch,parent,txt})=>{
    const b={channel_id:ch, body:txt, idempotency_key:'qtr-'+Math.random().toString(36).slice(2)};
    if(parent) b.thread_parent_id=parent;
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify(b)});
    const j=await r.json().catch(()=>({}));
    return {status:r.status, id:j.id, parent:j.thread_parent_id};},{ch,parent,txt});
};
