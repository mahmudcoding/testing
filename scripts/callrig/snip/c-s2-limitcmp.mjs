export default async ({page}) => {
  const gen='C4QCGENERAL0001';
  await page.goto('https://airion-cargo.store/w/W4QCF1XTURESO01/c/'+gen);
  await page.waitForTimeout(8000);
  return page.evaluate(async(gen)=>{
    const out=[];
    for(const lim of [5,10,25,50,75,100]){
      const r=await fetch(`/api/v1/messaging/channels/${gen}/messages?limit=${lim}`,{credentials:'include'});
      const j=await r.json().catch(()=>({}));
      const arr=j.messages||[];
      const seqs=arr.map(m=>m.channel_seq);
      out.push({limit:lim, status:r.status, returned:arr.length,
        maxSeq: seqs.length?Math.max(...seqs):null,
        minSeq: seqs.length?Math.min(...seqs):null,
        newest3: arr.slice(0,3).map(m=>({b:(m.body||'').slice(0,24), seq:m.channel_seq}))});
    }
    return out;
  }, gen);
};
