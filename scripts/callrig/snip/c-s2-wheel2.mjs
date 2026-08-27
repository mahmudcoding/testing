export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const appReqs=[];
  const onReq=(r)=>{const u=r.url();
    if(u.includes('/api/v1/')&&/channels\/[A-Z0-9]+\/messages\?/.test(u))
      appReqs.push({round:cur, q:u.split('/messages')[1].slice(0,46)});};
  let cur=0;
  page.on('request',onReq);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(12000);
  const box=await page.evaluate(()=>{
    const m=document.querySelector('main [data-message-id]'); if(!m) return null;
    const r=m.getBoundingClientRect(); return {x:Math.round(r.left+r.width/2), y:Math.round(r.top+r.height/2)};});
  const topId=()=>page.evaluate(()=>{
    const e=document.querySelector('main [data-message-id]');
    const sc=document.querySelector('[data-qa-scroller]');
    return {id:e?e.getAttribute('data-message-id'):null,
      n:document.querySelectorAll('main [data-message-id]').length};});
  const tops=[{round:0, ...(await topId())}];
  await page.mouse.move(box.x, box.y);
  for (cur=1; cur<=6; cur++){
    for (let i=0;i<30;i++){ await page.mouse.wheel(0,-800); await page.waitForTimeout(150); }
    await page.waitForTimeout(6000);
    tops.push({round:cur, ...(await topId())});
  }
  page.off('request',onReq);
  // resolve every observed top id to a channel_seq, AFTER scrolling is done
  const seqs=await page.evaluate(async (ids)=>{
    const ch='C4QCGENERAL0001'; const want=new Set(ids.filter(Boolean)); const map={};
    let before=null,pages=0;
    while(pages<15&&Object.keys(map).length<want.size){
      const u=`/api/v1/messaging/channels/${ch}/messages?limit=100`+(before?`&before_seq=${before}`:'');
      const r=await fetch(u,{credentials:'include'}); if(r.status!==200) break;
      const j=await r.json(); const m=(j&&j.messages)||[]; if(!m.length) break;
      for(const x of m) if(want.has(x.id)) map[x.id]=x.channel_seq;
      const wsq=m.filter(x=>typeof x.channel_seq==='number');
      const mn=wsq.reduce((a,b)=>a.channel_seq<b.channel_seq?a:b,wsq[0]);
      pages++; before=mn.channel_seq; if(m.length<100) break;}
    return map;}, tops.map(t=>t.id));
  return {progression:tops.map(t=>({round:t.round, rendered:t.n, topSeq:seqs[t.id]??'?'})),
          appFetches:appReqs};
};
