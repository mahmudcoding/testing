export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const reqs=[];
  const onReq=(r)=>{const u=r.url();
    if(u.includes('/api/v1/')&&/messages\?/.test(u)) reqs.push(u.split('/messages')[1].slice(0,50));};
  page.on('request',onReq);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(12000);
  const box=await page.evaluate(()=>{
    const m=document.querySelector('main [data-message-id]');
    if(!m) return null; const r=m.getBoundingClientRect();
    return {x:Math.round(r.left+r.width/2), y:Math.round(r.top+r.height/2)};});
  const topSeq=async()=>page.evaluate(async ()=>{
    const ids=[...document.querySelectorAll('main [data-message-id]')].map(e=>e.getAttribute('data-message-id'));
    const want=ids[0]; if(!want) return null;
    const ch='C4QCGENERAL0001'; let before=null,pages=0;
    while(pages<15){
      const u=`/api/v1/messaging/channels/${ch}/messages?limit=100`+(before?`&before_seq=${before}`:'');
      const r=await fetch(u,{credentials:'include'}); if(r.status!==200) break;
      const j=await r.json(); const m=(j&&j.messages)||[]; if(!m.length) break;
      const hit=m.find(x=>x.id===want); if(hit) return hit.channel_seq;
      const wsq=m.filter(x=>typeof x.channel_seq==='number');
      const mn=wsq.reduce((a,b)=>a.channel_seq<b.channel_seq?a:b,wsq[0]);
      pages++; before=mn.channel_seq; if(m.length<100) break;}
    return 'unknown';});
  const out=[{step:'initial', topSeq:await topSeq()}];
  await page.mouse.move(box.x, box.y);
  for (let round=1; round<=5; round++){
    reqs.length=0;
    for (let i=0;i<25;i++){ await page.mouse.wheel(0,-700); await page.waitForTimeout(160); }
    await page.waitForTimeout(5500);
    out.push({step:'wheel round '+round, topSeq:await topSeq(), fetched:reqs.slice(0,2)});
  }
  page.off('request',onReq);
  return out;
};
