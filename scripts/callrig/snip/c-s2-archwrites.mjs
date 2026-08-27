export default async ({page}) => {
  const ws='W4QCF1XTURESO01', arch='C4OX4NTD8DNF88E', normal='C4QCGENERAL0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${normal}`);
  await page.waitForTimeout(9000);
  return page.evaluate(async({arch,normal})=>{
    const j=async(p)=>{const r=await p; const t=await r.text();
      return {status:r.status, key:(t.match(/"key":"([^"]+)"/)||['','—'])[1]};};
    // find an existing message in the archived channel
    const lr=await fetch(`/api/v1/messaging/channels/${arch}/messages?limit=5`,{credentials:'include'});
    const lj=await lr.json().catch(()=>({}));
    const target=(lj.messages||[])[0];
    if(!target) return {err:'no message in the archived channel', listStatus:lr.status};
    const id=target.id;
    const out={targetBody:(target.body||'').slice(0,24), listStatus:lr.status, actions:{}};
    out.actions.send   = await j(fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:arch, body:'QA-ARCHW send', idempotency_key:'qaw-'+Math.random().toString(36).slice(2)})}));
    out.actions.edit   = await j(fetch(`/api/v1/messaging/channels/${arch}/messages/${id}`,{method:'PATCH',
      credentials:'include',headers:{'content-type':'application/json'},body:JSON.stringify({body:'QA-ARCHW edited'})}));
    out.actions.react  = await j(fetch(`/api/v1/messaging/channels/${arch}/messages/${id}/reactions`,{method:'POST',
      credentials:'include',headers:{'content-type':'application/json'},body:JSON.stringify({emoji:'🔥'})}));
    out.actions.pin    = await j(fetch(`/api/v1/messaging/channels/${arch}/messages/${id}/pin`,{method:'POST',
      credentials:'include',headers:{'content-type':'application/json'},body:JSON.stringify({pin:true})}));
    out.actions.unpin  = await j(fetch(`/api/v1/messaging/channels/${arch}/messages/${id}/pin`,{method:'POST',
      credentials:'include',headers:{'content-type':'application/json'},body:JSON.stringify({pin:false})}));
    out.actions.rename = await j(fetch(`/api/v1/channels/${arch}`,{method:'PATCH',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({name:'qa-c2-arch2', description:'throwaway: archived-channel checks'})}));
    out.actions.threadReply = await j(fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:arch, body:'QA-ARCHW thread', thread_parent_id:id,
        idempotency_key:'qawt-'+Math.random().toString(36).slice(2)})}));
    out.actions.delete = await j(fetch(`/api/v1/messaging/channels/${arch}/messages`,{method:'DELETE',
      credentials:'include',headers:{'content-type':'application/json'},
      body:JSON.stringify({message_ids:['M0000000000000']})}));  // nonexistent id: tests the archive gate, not deletion
    // what stuck?
    const after=await fetch(`/api/v1/messaging/channels/${arch}/messages?limit=5`,{credentials:'include'});
    const aj=await after.json().catch(()=>({}));
    const m=(aj.messages||[]).find(x=>x.id===id);
    out.persisted = m? {body:(m.body||'').slice(0,24), reactions:(m.reactions||[]).length, pinned:!!m.pinned} : 'gone';
    return out;}, {arch,normal});
};
