export default async ({page}) => {
  const gen='C4QCGENERAL0001';
  await page.goto('https://airion-cargo.store/w/W4QCF1XTURESO01/c/'+gen);
  await page.waitForTimeout(8000);
  return page.evaluate(async(gen)=>{
    const TXTS=['QA-S2-OFFLINE-dkvw','QA-S2-OFFL2-0vz8','QA-S2-OFFL3-tewc'];
    let before=null; const seqs=[]; const found=[]; let pages=0; const oddities=[];
    for(let p=0;p<12;p++){
      const u=`/api/v1/messaging/channels/${gen}/messages?limit=100`+(before!==null?`&before_seq=${before}`:'');
      const r=await fetch(u,{credentials:'include'}); if(!r.ok) break;
      const j=await r.json(); const arr=j.messages||[];
      if(!arr.length) break;
      pages++;
      for(const m of arr){
        seqs.push(m.channel_seq);
        if(m.channel_seq===null||m.channel_seq===undefined||m.channel_seq===0)
          oddities.push({id:m.id, seq:m.channel_seq, b:(m.body||'').slice(0,24)});
        for(const t of TXTS) if((m.body||'').includes(t)) found.push({t, seq:m.channel_seq});
      }
      const min=Math.min(...arr.map(m=>m.channel_seq));
      if(before!==null && min>=before) break;
      before=min;
    }
    seqs.sort((a,b)=>a-b);
    return {pages, count:seqs.length, minSeq:seqs[0], maxSeq:seqs[seqs.length-1],
      found, oddities: oddities.slice(0,5),
      gaps: (()=>{const g=[];for(let i=1;i<seqs.length;i++) if(seqs[i]-seqs[i-1]>1)
        g.push([seqs[i-1],seqs[i]]); return g.slice(0,8);})()};
  }, gen);
};
