export default async ({page}) => {
  const ws='W4QCF1XTURESO01', BOB='U4QCBOB00000001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(8000);
  out.dm=await page.evaluate(async({ws,BOB})=>{
    const list=await fetch(`/api/v1/messaging/me/direct?workspace_id=${ws}`,{credentials:'include'});
    const lj=await list.json().catch(()=>({}));
    const arr=lj.dms||lj.channels||lj.items||(Array.isArray(lj)?lj:[]);
    const existing=arr.find(d=>JSON.stringify(d).includes(BOB));
    if(existing) return {reused:true, id:existing.channel_id||existing.id,
      listKeys:Object.keys(lj).slice(0,4)};
    const c=await fetch('/api/v1/messaging/dm',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({workspace_id:ws, user_id_1:'U4QCCAROL000001', user_id_2:BOB})});
    const t=await c.text(); let j={}; try{j=JSON.parse(t);}catch(e){}
    return {created:c.status, id:j.channel_id||j.id, raw:c.ok?undefined:t.slice(0,140),
      listKeys:Object.keys(lj).slice(0,4), listCount:arr.length};},{ws,BOB});
  if(!out.dm.id) return out;
  out.fill=await page.evaluate(async(dm)=>{
    const have=await fetch(`/api/v1/messaging/channels/${dm}/messages?limit=5`,{credentials:'include'});
    const hj=await have.json().catch(()=>({}));
    const start=(hj.messages||[]).length;
    let ok=0, first=null, err=null;
    for(let b=1;b<=250;b+=8){
      const batch=[];
      for(let i=b;i<b+8&&i<=250;i++){
        batch.push(fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
          headers:{'content-type':'application/json'},
          body:JSON.stringify({channel_id:dm, body:`QA-S2-DM-${String(i).padStart(3,'0')}`,
            idempotency_key:'qadm-'+Math.random().toString(36).slice(2)})}).then(r=>r.ok?r.json():null));
      }
      const res=await Promise.all(batch);
      for(const r of res){ if(r){ ok++; if(!first) first=r; } }
    }
    return {had:start, added:ok, firstId:first&&first.id, firstSeq:first&&first.channel_seq};}, out.dm.id);
  // find the oldest QA-S2-DM message and deep-link to it
  out.target=await page.evaluate(async(dm)=>{
    let before=null, oldest=null;
    for(let p=0;p<5;p++){
      const u=`/api/v1/messaging/channels/${dm}/messages?limit=100`+(before!==null?`&before_seq=${before}`:'');
      const r=await fetch(u,{credentials:'include'}); if(!r.ok) break;
      const j=await r.json(); const arr=j.messages||[]; if(!arr.length) break;
      for(const m of arr) if(!oldest||m.channel_seq<oldest.channel_seq) oldest=m;
      const min=Math.min(...arr.map(m=>m.channel_seq));
      if(before!==null && min>=before) break;
      before=min;
    }
    return oldest?{id:oldest.id, seq:oldest.channel_seq, body:(oldest.body||'').slice(0,18)}:null;}, out.dm.id);
  if(!out.target) return out;
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${out.dm.id}?m=${out.target.id}`);
  const marks=[];
  for(let i=0;i<20;i++){
    await page.waitForTimeout(1000);
    marks.push(await page.evaluate((id)=>{
      const el=document.querySelector(`[data-message-id="${id}"]`);
      const loaded=document.querySelectorAll('main [data-message-id]').length;
      if(!el) return {loaded, present:false};
      const r=el.getBoundingClientRect();
      return {loaded, present:true, top:Math.round(r.top), inView:r.top>=-4&&r.bottom<=innerHeight+4};
    }, out.target.id));
    const l=marks[marks.length-1]; if(l.present&&l.inView&&i>=2) break;
  }
  out.deepLink={waitedSec:marks.length, everPresent:marks.some(m=>m.present),
    everInView:marks.some(m=>m.inView), final:marks[marks.length-1]};
  return out;
};
