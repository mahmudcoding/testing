export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const appReqs=[]; let cur=0;
  const onReq=(r)=>{const u=r.url();
    if(u.includes('/api/v1/')&&/channels\/[A-Z0-9]+\/messages\?/.test(u))
      appReqs.push(`r${cur}: `+u.split('/messages')[1].slice(0,42));};
  page.on('request',onReq);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(12000);
  await page.evaluate(()=>{
    const m=document.querySelector('main [data-message-id]');
    let n=m&&m.parentElement;
    while(n&&n!==document.body){const s=getComputedStyle(n);
      if(n.scrollHeight>n.clientHeight+40&&/auto|scroll/.test(s.overflowY)){n.setAttribute('data-qa-scroller','1');return;}
      n=n.parentElement;}});
  const top=()=>page.evaluate(()=>{
    const e=document.querySelector('main [data-message-id]');
    const sc=document.querySelector('[data-qa-scroller]');
    return {id:e?e.getAttribute('data-message-id'):null,
      h:sc?Math.round(sc.scrollHeight):null};});
  const seen=[await top()];
  for (cur=1; cur<=8; cur++){
    await page.evaluate(()=>{const sc=document.querySelector('[data-qa-scroller]'); if(sc) sc.scrollTop=2500;});
    await page.waitForTimeout(900);
    for (const t of [1200,500,150,0]) {
      await page.evaluate((t)=>{const sc=document.querySelector('[data-qa-scroller]'); if(sc) sc.scrollTop=t;},t);
      await page.waitForTimeout(800);
    }
    await page.waitForTimeout(4500);
    seen.push(await top());
  }
  page.off('request',onReq);
  const seqs=await page.evaluate(async (ids)=>{
    const ch='C4QCGENERAL0001'; const want=new Set(ids.filter(Boolean)); const map={};
    let before=null,pages=0, minSeq=null;
    while(pages<15){
      const u=`/api/v1/messaging/channels/${ch}/messages?limit=100`+(before?`&before_seq=${before}`:'');
      const r=await fetch(u,{credentials:'include'}); if(r.status!==200) break;
      const j=await r.json(); const m=(j&&j.messages)||[]; if(!m.length) break;
      for(const x of m) if(want.has(x.id)) map[x.id]=x.channel_seq;
      const wsq=m.filter(x=>typeof x.channel_seq==='number');
      const mn=wsq.reduce((a,b)=>a.channel_seq<b.channel_seq?a:b,wsq[0]);
      minSeq=minSeq===null?mn.channel_seq:Math.min(minSeq,mn.channel_seq);
      pages++; before=mn.channel_seq; if(m.length<100) break;}
    return {map, channelOldestSeq:minSeq};}, seen.map(s=>s.id));
  return {progression:seen.map((s,i)=>`round ${i}: topSeq=${seqs.map[s.id]??'?'} scrollH=${s.h}`),
          channelOldestSeq:seqs.channelOldestSeq, appFetches:appReqs};
};
