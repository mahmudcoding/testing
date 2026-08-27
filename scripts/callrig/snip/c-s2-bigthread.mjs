export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const N=parseInt(process.env.QA_N||'140',10);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  return page.evaluate(async({ch,N})=>{
    const post=async(body,parent)=>{
      const b={channel_id:ch, body, idempotency_key:'qat-'+Math.random().toString(36).slice(2)};
      if(parent) b.thread_parent_id=parent;
      const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
        headers:{'content-type':'application/json'}, body:JSON.stringify(b)});
      if(!r.ok) return {err:r.status, body:(await r.text()).slice(0,120)};
      return r.json();
    };
    const parent=await post('QA-S2-BIGTHREAD2-parent');
    if(parent.err) return {stage:'parent', ...parent};
    let ok=0, firstErr=null;
    for(let b=1;b<=N;b+=7){
      const batch=[];
      for(let i=b;i<b+7&&i<=N;i++) batch.push(post(`QA-S2-BT2-${String(i).padStart(3,'0')}`, parent.id));
      const res=await Promise.all(batch);
      for(const r of res){ if(r&&!r.err) ok++; else if(!firstErr) firstErr=r; }
    }
    const t=await fetch(`/api/v1/messaging/messages/${parent.id}/thread?limit=100`,{credentials:'include'});
    const tj=await t.json().catch(()=>({}));
    return {parent:parent.id, posted:ok, firstErr,
      threadStatus:t.status, repliesReturned:(tj.replies||[]).length,
      parentReplyCount: tj.parent && tj.parent.reply_count,
      keys:Object.keys(tj).slice(0,6)};
  }, {ch,N});
};
