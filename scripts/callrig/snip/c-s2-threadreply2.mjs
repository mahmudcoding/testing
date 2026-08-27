export default async ({page}) => {
  const parent=process.env.QA_PARENT, body=process.env.QA_BODY||'QA-S2-THREADUNREAD';
  return page.evaluate(async({parent,body})=>{
    const r=await fetch(`/api/v1/messaging/messages/${parent}/reply`,{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({body, idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    const j=await r.json().catch(()=>({}));
    return {status:r.status, id:j.id};
  }, {parent,body});
};
