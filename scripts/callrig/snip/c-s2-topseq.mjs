export default async ({page}) => {
  await page.evaluate(()=>{const sc=document.querySelector('[data-qa-scroller]'); if(sc) sc.scrollTop=0;});
  await page.waitForTimeout(2500);
  return page.evaluate(async ()=>{
    const ch='C4QCGENERAL0001';
    const domIds=[...document.querySelectorAll('main [data-message-id]')]
      .map(e=>e.getAttribute('data-message-id'));
    const want=new Set(domIds.slice(0,5));
    let before=null, pages=0, found=[];
    while(pages<15 && found.length<5){
      const u=`/api/v1/messaging/channels/${ch}/messages?limit=100`+(before?`&before_seq=${before}`:'');
      const r=await fetch(u,{credentials:'include'});
      if(r.status!==200) break;
      const j=await r.json(); const m=(j&&j.messages)||[];
      if(!m.length) break;
      for(const x of m) if(want.has(x.id)) found.push({id:x.id.slice(-5), seq:x.channel_seq});
      const withSeq=m.filter(x=>typeof x.channel_seq==='number');
      const mn=withSeq.reduce((a,b)=>a.channel_seq<b.channel_seq?a:b, withSeq[0]);
      pages++; before=mn.channel_seq;
      if(m.length<100) break;
    }
    const sc=document.querySelector('[data-qa-scroller]');
    return {scrollTop:sc?Math.round(sc.scrollTop):null, renderedCount:domIds.length,
      topFiveSeqs:found.sort((a,b)=>a.seq-b.seq).slice(0,5)};
  });
};
