export default async ({page}) => page.evaluate(async ()=>{
  const ch='C4QCGENERAL0001';
  let before=null, total=0, pages=0, oldest=null, newest=null;
  while (pages<15) {
    const u=`/api/v1/messaging/channels/${ch}/messages?limit=100`+(before?`&before_seq=${before}`:'');
    const r=await fetch(u,{credentials:'include'});
    if(r.status!==200) return {error:r.status, pages, total, before};
    const j=await r.json();
    const m=(j&&(j.messages||j.items))||[];
    if(!m.length) break;
    const seqs=m.map(x=>x.channel_seq).filter(x=>typeof x==='number');
    if(pages===0) newest=Math.max(...seqs);
    oldest=Math.min(...seqs);
    total+=m.length; pages++; before=oldest;
    if(m.length<100) break;
  }
  return {totalFetched:total, pages, oldestSeq:oldest, newestSeq:newest};
});
