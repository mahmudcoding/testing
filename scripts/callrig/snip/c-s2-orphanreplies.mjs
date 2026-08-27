export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(9000);
  const ch=await page.evaluate(async(ws)=>{
    const r=await fetch('/api/v1/channels',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({name:'qa-c2-orphan', workspace_id:ws, type:'public',
        description:'throwaway: orphaned thread replies'})});
    const j=await r.json(); return j.id||j.channel_id;}, ws);
  await page.waitForTimeout(6000);          // let the messaging replica catch up
  const out=await page.evaluate(async(ch)=>{
    const post=async(body,parent)=>{
      const b={channel_id:ch, body, idempotency_key:'qor-'+Math.random().toString(36).slice(2)};
      if(parent) b.thread_parent_id=parent;
      const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
        headers:{'content-type':'application/json'}, body:JSON.stringify(b)});
      return r.ok? (await r.json()) : null;};
    let parent=null;
    for(let i=0;i<6 && !parent;i++){
      parent=await post('QA-ORPH parent');
      if(!parent) await new Promise(r=>setTimeout(r,2500));
    }
    if(!parent) return {err:'parent could not be posted — replica lag'};
    const reps=[];
    for(let i=1;i<=3;i++) reps.push(await post('QA-ORPH reply '+i, parent.id));
    await new Promise(r=>setTimeout(r,2500));
    const before=await fetch(`/api/v1/messaging/messages/${parent.id}/thread?limit=10`,{credentials:'include'});
    const bj=await before.json().catch(()=>({}));
    // delete the parent
    const d=await fetch(`/api/v1/messaging/channels/${ch}/messages`,{method:'DELETE',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify({message_ids:[parent.id]})});
    await new Promise(r=>setTimeout(r,3500));
    const after=await fetch(`/api/v1/messaging/messages/${parent.id}/thread?limit=10`,{credentials:'include'});
    const at=await after.text();
    // are the replies still retrievable by other means?
    const walk=async()=>{
      let before=null, found=[];
      for(let p=0;p<4;p++){
        const u=`/api/v1/messaging/channels/${ch}/messages?limit=100`+(before!==null?`&before_seq=${before}`:'');
        const r=await fetch(u,{credentials:'include'}); if(!r.ok) break;
        const j=await r.json(); const arr=j.messages||[]; if(!arr.length) break;
        for(const m of arr) if(reps.some(x=>x&&x.id===m.id)) found.push({id:m.id, body:(m.body||'').slice(0,20), seq:m.channel_seq});
        const min=Math.min(...arr.map(m=>m.channel_seq));
        if(before!==null && min>=before) break;
        before=min;
      }
      return found;};
    const inChannelList=await walk();
    const parentRow=await (async()=>{
      const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=40`,{credentials:'include'});
      const j=await r.json(); const m=(j.messages||[]).find(x=>x.id===parent.id);
      return m? {body:(m.body||'')||'(empty)', reply_count:m.reply_count}:'absent';})();
    return {repliesCreated:reps.filter(Boolean).length,
      threadBefore:{status:before.status, replies:(bj.replies||[]).length},
      deleteStatus:d.status,
      threadAfter:{status:after.status, key:(at.match(/"key":"([^"]+)"/)||['','—'])[1]},
      parentRow, repliesStillInChannelList:inChannelList};}, ch);
  await page.evaluate(async(ch)=>{
    await fetch(`/api/v1/channels/${ch}/archive`,{method:'POST',credentials:'include'});}, ch);
  return {channel:ch, ...out};
};
