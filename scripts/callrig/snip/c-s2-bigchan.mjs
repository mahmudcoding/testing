export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const N=parseInt(process.env.QA_N||'400',10);
  return page.evaluate(async ({ws,N})=>{
    // reuse the channel if a previous run made it
    const list=await (await fetch(`/api/v1/workspaces/${ws}/channels`,{credentials:'include'})).json();
    const arr=Array.isArray(list)?list:(list.channels||list.items||[]);
    let ch=arr.find(c=>c.name==='qa-c2-deep');
    if(!ch){
      const r=await fetch('/api/v1/channels',{method:'POST',credentials:'include',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({name:'qa-c2-deep', workspace_id:ws, type:'public',
          description:'throwaway: deep-link to old message'})});
      if(!r.ok) return {err:'create failed', status:r.status, body:(await r.text()).slice(0,200)};
      ch=await r.json();
    }
    const id=ch.id||ch.channel_id;
    const have=await (await fetch(`/api/v1/messaging/channels/${id}/messages?limit=1`,{credentials:'include'})).json().catch(()=>({}));
    const post=async(i)=>{
      const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({channel_id:id, body:`QA-DEEP-${String(i).padStart(4,'0')}`,
          idempotency_key:'qadeep-'+i+'-'+Math.random().toString(36).slice(2)})});
      if(!r.ok) return null;
      const j=await r.json(); return {i, id:j.id, seq:j.channel_seq};
    };
    const made=[];
    for(let b=1;b<=N;b+=8){
      const batch=[]; for(let i=b;i<b+8&&i<=N;i++) batch.push(post(i));
      const res=await Promise.all(batch);
      for(const x of res) if(x) made.push(x);
    }
    return {channel:id, name:ch.name, posted:made.length,
      first:made[0], seventh:made[6], last:made[made.length-1],
      preexisting: (have.messages||have.items||[]).length};
  }, {ws,N});
};
