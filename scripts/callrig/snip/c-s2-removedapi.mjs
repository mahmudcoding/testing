export default async ({page}) => {
  const ch='C4QCPRIVATE0001';
  return page.evaluate(async (ch)=>{
    const j=async(r)=>({status:r.status, body:(await r.text()).slice(0,180)});
    const get=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=3`,{credentials:'include'});
    const post=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-S2-AFTER-REMOVE', idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    const list=await fetch(`/api/v1/workspaces/W4QCF1XTURESO01/channels`,{credentials:'include'});
    const lb=await list.text();
    return {readMessages: await j(get), postMessage: await j(post),
      channelListStatus:list.status, privateStillListed: lb.includes(ch)};
  }, ch);
};
