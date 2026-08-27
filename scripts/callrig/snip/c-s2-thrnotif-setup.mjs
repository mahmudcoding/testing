export default async ({page}) => page.evaluate(async ()=>{
  const ch='C4QCGENERAL0001';
  const p=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},body:JSON.stringify({channel_id:ch,body:'QA-THRNOTIF parent'})});
  const pj=await p.json(); const pid=pj.id||pj.message?.id;
  return {parent:pid};
});
