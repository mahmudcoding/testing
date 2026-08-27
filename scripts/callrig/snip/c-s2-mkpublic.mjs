export default async ({page}) => page.evaluate(async ()=>{
  const ws='W4QCF1XTURESO01';
  const name='qa-c2-join-'+Math.random().toString(36).slice(2,6);
  const r=await fetch('/api/v1/channels',{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({name, workspace_id:ws, type:'public'})});
  const j=await r.json(); const id=j.id||j.channel_id||(j.channel&&j.channel.id);
  await new Promise(x=>setTimeout(x,2000));
  await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({channel_id:id,body:'QA-JOIN-seed message'})});
  return {status:r.status, name, id};
});
