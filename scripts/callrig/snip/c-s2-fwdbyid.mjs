export default async ({page}) => page.evaluate(async()=>{
  const j=await (await fetch('/api/v1/messaging/channels/C4QCGENERAL0001/messages?limit=30',{credentials:'include'})).json();
  const ms=j.messages||j.data||j||[];
  const m=ms.find(x=>x.id==='M4OWW521DG4EV16');
  if(!m) return {found:false, ids:ms.slice(0,4).map(x=>x.id)};
  return {found:true, body:(m.body||'').slice(0,60),
    files:m.files??null, filesLen:(m.files||[]).length,
    forwardedKeys:Object.keys(m).filter(k=>/forward|origin|source|quote/i.test(k)),
    forwarded_from: m.forwarded_from? {keys:Object.keys(m.forwarded_from),
      files:(m.forwarded_from.files||[]).map(f=>f.filename)}:null};
});
