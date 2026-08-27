export default async ({page}) => page.evaluate(async ()=>{
  const ch='C4QCGENERAL0001';
  let before=null, all=[], pages=0;
  while(pages<15){
    const u=`/api/v1/messaging/channels/${ch}/messages?limit=100`+(before?`&before_seq=${before}`:'');
    const r=await fetch(u,{credentials:'include'});
    if(r.status!==200) break;
    const j=await r.json(); const m=(j&&j.messages)||[];
    if(!m.length) break;
    all=all.concat(m);
    const ws=m.filter(x=>typeof x.channel_seq==='number');
    const mn=ws.reduce((a,b)=>a.channel_seq<b.channel_seq?a:b, ws[0]);
    pages++; before=mn.channel_seq;
    if(m.length<100) break;
  }
  const low=all.filter(x=>x.channel_seq<=20).sort((a,b)=>a.channel_seq-b.channel_seq);
  const dom=new Set([...document.querySelectorAll('main [data-message-id]')]
    .map(e=>e.getAttribute('data-message-id')));
  return {fetched:all.length,
    lowSeqs:low.map(x=>({seq:x.channel_seq, type:x.type??x.message_type??'(none)',
      body:(x.body||'').slice(0,22), deleted:x.deleted??x.is_deleted??null,
      inDom:dom.has(x.id)})).slice(0,10)};
});
