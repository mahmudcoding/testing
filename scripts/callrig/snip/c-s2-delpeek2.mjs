export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const TAGS=['QA-S2-DELR-54v','QA-S2-DSC-B','QA-S2-DSC-A'];
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  return page.evaluate(async({ch,TAGS})=>{
    let before=null; const all=[];
    for(let p=0;p<6;p++){
      const u=`/api/v1/messaging/channels/${ch}/messages?limit=100`+(before!==null?`&before_seq=${before}`:'');
      const r=await fetch(u,{credentials:'include'}); if(!r.ok) break;
      const j=await r.json(); const arr=j.messages||[]; if(!arr.length) break;
      for(const m of arr) all.push({seq:m.channel_seq, body:(m.body||''), id:m.id});
      const min=Math.min(...arr.map(m=>m.channel_seq));
      if(before!==null && min>=before) break;
      before=min;
    }
    all.sort((a,b)=>b.seq-a.seq);
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const joined=els.map(e=>e.innerText||'').join(' ');
    return {walked:all.length, seqRange:[all[all.length-1]&&all[all.length-1].seq, all[0]&&all[0].seq],
      newest6:all.slice(0,6).map(m=>`${m.seq}:${m.body.slice(0,22)||'(empty)'}`),
      hits:TAGS.map(t=>({tag:t,
        inApi: all.filter(m=>m.body.includes(t)).map(m=>`seq ${m.seq}`),
        inDom: joined.includes(t)}))};
  },{ch,TAGS});
};
