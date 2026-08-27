export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(9000);
  return page.evaluate(async(ws)=>{
    const r=await fetch('/api/v1/channels',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({name:'qa-c2-orphan2', workspace_id:ws, type:'public',
        description:'throwaway: orphan diag'})});
    const t=await r.text(); let j={}; try{j=JSON.parse(t);}catch(e){}
    const id=j.id||j.channel_id;
    const out={createStatus:r.status, createBody:t.slice(0,180), id};
    if(!id) return out;
    await new Promise(x=>setTimeout(x,4000));
    const g=await fetch(`/api/v1/channels/${id}`,{credentials:'include'});
    out.getChannel={status:g.status, body:(await g.text()).slice(0,120)};
    const m=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:id, body:'QA-DIAG ping', idempotency_key:'qd-'+Math.random().toString(36).slice(2)})});
    out.post={status:m.status, body:(await m.text()).slice(0,180)};
    return out;}, ws);
};
