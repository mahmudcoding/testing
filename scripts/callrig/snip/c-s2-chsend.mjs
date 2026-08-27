export default async ({page}) => page.evaluate(async ()=>{
  const ch='C4QCPRIVATE0001', alice='U4QCALICE000001';
  const plain=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({channel_id:ch, body:'QA-CHORDER plain '+Math.random().toString(36).slice(2,5)})});
  await new Promise(r=>setTimeout(r,9000));
  const ment=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({channel_id:ch, body:'QA-CHORDER mention '+Math.random().toString(36).slice(2,5),
                         mention_user_ids:[alice]})});
  return {plain:plain.status, mention:ment.status};
});
