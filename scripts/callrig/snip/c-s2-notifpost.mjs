export default async ({page}) => page.evaluate(async ()=>{
  const ch='C4OXDY9FPZM92FH', alice='U4QCALICE000001';
  const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({channel_id:ch, body:'QA-ARCHNOTIF ping', mention_user_ids:[alice]})});
  return {status:r.status};
});
