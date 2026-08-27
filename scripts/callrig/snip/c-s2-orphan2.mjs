export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch=process.env.QA_CH;
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const out=await page.evaluate(async(ch)=>{
    const post=async(body,parent)=>{
      const b={channel_id:ch, body, idempotency_key:'qor-'+Math.random().toString(36).slice(2)};
      if(parent) b.thread_parent_id=parent;
      const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
        headers:{'content-type':'application/json'}, body:JSON.stringify(b)});
      if(!r.ok) return {err:r.status, body:(await r.text()).slice(0,120)};
      return await r.json();};
    const parent=await post('QA-ORPH parent');
    if(parent.err) return {stage:'parent', ...parent};
    const reps=[];
    for(let i=1;i<=3;i++) reps.push(await post('QA-ORPH reply '+i, parent.id));
    await new Promise(r=>setTimeout(r,2500));
    const before=await fetch(`/api/v1/messaging/messages/${parent.id}/thread?limit=10`,{credentials:'include'});
    const bj=await before.json().catch(()=>({}));
    const d=await fetch(`/api/v1/messaging/channels/${ch}/messages`,{method:'DELETE',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify({message_ids:[parent.id]})});
    const dt=await d.text();
    await new Promise(r=>setTimeout(r,3500));
    const after=await fetch(`/api/v1/messaging/messages/${parent.id}/thread?limit=10`,{credentials:'include'});
    const at=await after.text();
    // are the replies retrievable any other way?
    const byId=[];
    for(const rp of reps){
      if(!rp||rp.err) continue;
      const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=100`,{credentials:'include'});
      const j=await r.json().catch(()=>({}));
      byId.push({id:rp.id, inChannelList:(j.messages||[]).some(m=>m.id===rp.id)});
      break;
    }
    const parentRow=await (async()=>{
      const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=40`,{credentials:'include'});
      const j=await r.json(); const m=(j.messages||[]).find(x=>x.id===parent.id);
      return m? {body:(m.body||'')||'(empty)', reply_count:m.reply_count}:'absent';})();
    return {repliesCreated:reps.filter(x=>x&&!x.err).length,
      threadBefore:{status:before.status, replies:(bj.replies||[]).length},
      deleteStatus:d.status, deleteBody:dt.slice(0,80),
      threadAfter:{status:after.status, key:(at.match(/"key":"([^"]+)"/)||['','—'])[1]},
      parentRow, sampleReply:byId[0]||null};}, ch);
  await page.evaluate(async(ch)=>{
    await fetch(`/api/v1/channels/${ch}/archive`,{method:'POST',credentials:'include'});}, ch);
  return out;
};
