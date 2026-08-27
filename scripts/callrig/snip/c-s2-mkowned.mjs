export default async ({page}) => page.evaluate(async ()=>{
  const ws='W4QCF1XTURESO01', alice='U4QCALICE000001';
  const name='qa-c2-del-'+Math.random().toString(36).slice(2,6);
  const c=await fetch('/api/v1/channels',{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({name, workspace_id:ws, type:'private'})});
  const cj=await c.json(); const id=cj.id||cj.channel_id||(cj.channel&&cj.channel.id);
  await new Promise(r=>setTimeout(r,2500));
  await fetch('/api/v1/channels/members/add',{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},body:JSON.stringify({channel_id:id,user_id:alice})});
  await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({channel_id:id,body:'QA-LIVEDEL seed message'})});
  return {id,name};
});
