export default async ({page}) => page.evaluate(async ()=>{
  const tag='QA-NOTIF1-'+Math.random().toString(36).slice(2,5);
  const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({channel_id:'C4QCGENERAL0001', body:tag,
                         mention_user_ids:['U4QCALICE000001']})});
  return {status:r.status, tag};
});
