export default async ({page}) => {
  const ws='W4QCF1XTURESO01', bob='U4QCBOB00000001';
  const made=await page.evaluate(async ({ws,bob})=>{
    const name='qa-c2-notif-'+Math.random().toString(36).slice(2,6);
    const c=await fetch('/api/v1/channels',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({name, workspace_id:ws, type:'private'})});
    const cj=await c.json(); const id=cj.id||cj.channel_id||(cj.channel&&cj.channel.id);
    await new Promise(r=>setTimeout(r,2500));
    await fetch('/api/v1/channels/members/add',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({channel_id:id,user_id:bob})});
    return {id,name};},{ws,bob});
  return made;
};
