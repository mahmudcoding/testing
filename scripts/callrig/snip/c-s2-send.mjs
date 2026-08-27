export default async ({page}) => {
  const txt=process.env.QA_MSG||'QA-S2-PING';
  const ch=page.url().split('/c/')[1];
  return page.evaluate(async({ch,txt})=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:txt, idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    return {status:r.status, sent:txt};
  }, {ch,txt});
};
