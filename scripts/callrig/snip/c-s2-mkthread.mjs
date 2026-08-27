export default async ({page}) => {
  const ch='C4QCGENERAL0001';
  return page.evaluate(async(ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-S2-V24PARENT', idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    return {id:(await r.json()).id};}, ch);
};
