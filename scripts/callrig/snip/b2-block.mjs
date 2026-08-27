export default async ({page}) => await page.evaluate(async(env)=>{
  const r=await fetch('/api/v1/messaging/users/'+(env.unblock?'unblock':'block'),
    {method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},
     body: JSON.stringify({user_id: env.target})});
  const t=await r.text();
  return {action: env.unblock?'unblock':'block', s:r.status, b:t.slice(0,220)};
}, {target: process.env.QA_TARGET, unblock: process.env.QA_UNBLOCK==='1'});
