export default async ({page}) => {
  const gen='C4QCGENERAL0001';
  const TXTS=['QA-S2-OFFLINE-dkvw','QA-S2-OFFL2-0vz8','QA-S2-OFFL3-tewc'];
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QCF1XTURESO01/c/'+gen);
  await page.waitForTimeout(9000);
  // 1. what does the DOM actually hold for these texts?
  out.domDetail=await page.evaluate((TXTS)=>{
    return TXTS.map(t=>{
      const el=[...document.querySelectorAll('main [data-message-id]')]
        .find(e=>(e.innerText||'').includes(t));
      if(!el) return {t, inDom:false};
      return {t, inDom:true, mid:el.getAttribute('data-message-id'),
        tail:(el.innerText||'').replace(/\s+/g,' ').slice(-40)};});}, TXTS);
  // 2. walk the whole channel history via before_seq and look for them
  out.apiWalk=await page.evaluate(async({gen,TXTS})=>{
    let before=null, pages=0, total=0; const found=[];
    for(let p=0;p<8;p++){
      const u=`/api/v1/messaging/channels/${gen}/messages?limit=100`+(before!==null?`&before_seq=${before}`:'');
      const r=await fetch(u,{credentials:'include'}); if(!r.ok) break;
      const j=await r.json(); const arr=j.messages||[];
      if(!arr.length) break;
      pages++; total+=arr.length;
      for(const m of arr) for(const t of TXTS) if((m.body||'').includes(t))
        found.push({t, id:m.id, seq:m.channel_seq});
      const min=Math.min(...arr.map(m=>m.channel_seq));
      if(before!==null && min>=before) break;
      before=min;
    }
    return {pages, total, found};},{gen,TXTS});
  // 3. hard reload from the network, then re-check the DOM
  await page.evaluate(()=>{ try{localStorage.clear();}catch(e){} });
  await page.goto('about:blank'); await page.waitForTimeout(1000);
  await page.goto('https://airion-cargo.store/w/W4QCF1XTURESO01/c/'+gen);
  await page.waitForTimeout(11000);
  out.domAfterHardReload=await page.evaluate((TXTS)=>TXTS.map(t=>({t,
    inDom:[...document.querySelectorAll('main [data-message-id]')]
      .some(e=>(e.innerText||'').includes(t))})), TXTS);
  return out;
};
