export default async ({page}) => page.evaluate(async (pid)=>{
  const r=await fetch(`/api/v1/messaging/messages/${pid}/reply`,{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({channel_id:'C4QCGENERAL0001', body:'QA-THRNOTIF reply from '+Math.random().toString(36).slice(2,5)})});
  let j=null; try{j=await r.json()}catch{}
  return {status:r.status, id:(j&&(j.id||j.message?.id)||'').slice(-5)};
}, process.env.QA_PID);
