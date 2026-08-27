export default async ({page}) => page.evaluate(async ()=>{
  const ch='C4QCGENERAL0001', out=[];
  for (let i=1;i<=2;i++){
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch,body:'QA-UNREAD-'+i+'-'+Math.random().toString(36).slice(2,5)})});
    out.push(r.status);
    await new Promise(r2=>setTimeout(r2,2500));
  }
  return {posted:out};
});
