export default async ({page}) => page.evaluate(async ()=>{
  const r=await fetch('/api/v1/messaging/channels/C4QCGENERAL0001/messages?limit=3',{credentials:'include'});
  const j=await r.json();
  const m=(j&&(j.messages||j.items))||[];
  return {topKeys:Object.keys(j||{}), n:m.length,
    firstKeys:m[0]?Object.keys(m[0]):null,
    seqs:m.map(x=>x.seq ?? x.sequence ?? null),
    sample:m[0]?JSON.stringify(m[0]).slice(0,200):null};
});
