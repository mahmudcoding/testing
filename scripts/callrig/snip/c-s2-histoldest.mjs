export default async ({page}) => page.evaluate(async ()=>{
  const ch='C4QCGENERAL0001';
  let before=null, oldest=null, oldestId=null, pages=0;
  while(pages<15){
    const u=`/api/v1/messaging/channels/${ch}/messages?limit=100`+(before?`&before_seq=${before}`:'');
    const r=await fetch(u,{credentials:'include'});
    if(r.status!==200) break;
    const j=await r.json(); const m=(j&&j.messages)||[];
    if(!m.length) break;
    const withSeq=m.filter(x=>typeof x.channel_seq==='number');
    const mn=withSeq.reduce((a,b)=>a.channel_seq<b.channel_seq?a:b, withSeq[0]);
    if(oldest===null||mn.channel_seq<oldest){oldest=mn.channel_seq; oldestId=mn.id;}
    pages++; before=mn.channel_seq;
    if(m.length<100) break;
  }
  const domIds=new Set([...document.querySelectorAll('main [data-message-id]')]
    .map(e=>e.getAttribute('data-message-id')));
  const topDom=[...document.querySelectorAll('main [data-message-id]')][0];
  return {oldestSeqInChannel:oldest, oldestIdSuffix:oldestId?oldestId.slice(-5):null,
    oldestIsRendered:oldestId?domIds.has(oldestId):null,
    renderedCount:domIds.size,
    topRenderedId:topDom?topDom.getAttribute('data-message-id').slice(-5):null};
});
