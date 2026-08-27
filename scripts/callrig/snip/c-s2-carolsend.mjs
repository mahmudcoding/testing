export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const r=await page.evaluate(async(ws)=>{
    const j=await (await fetch(`/api/v1/workspaces/${ws}/channels`,{credentials:'include'})).json();
    return (j.channels||j.data||j||[]).map(c=>({id:c.id,name:c.name,type:c.type}));
  }, ws);
  // find the DM with alice via the dm endpoint
  const dm=await page.evaluate(async(ws)=>{
    const res=await fetch('/api/v1/messaging/dm',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({workspace_id:ws, user_id_1:'U4QCCAROL000001', user_id_2:'U4QCALICE000001'})});
    const j=await res.json(); return {status:res.status, id:j.id||j.channel_id, keys:Object.keys(j).slice(0,6)};
  }, ws);
  if(!dm.id) return {dm, channels:r};
  const sent=await page.evaluate(async(ch)=>{
    const res=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-S2-CAROL-DM', idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    const j=await res.json(); return {status:res.status, id:j.id, user:j.user_id};
  }, dm.id);
  return {dm, sent};
};
