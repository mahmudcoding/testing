export default async ({page}) => page.evaluate(async ()=>{
  const ch='C4QCPRIVATE0001';
  const r=await fetch(`/api/v1/messaging/channels/${ch}/messages/pinned`,{credentials:'include'});
  const j=await r.json(); const m=(j&&j.messages)||[];
  for(const x of m) await fetch(`/api/v1/messaging/channels/${ch}/messages/${x.id}/pin`,
    {method:'POST',credentials:'include',headers:{'content-type':'application/json'},
     body:JSON.stringify({pin:false})});
  const r2=await fetch(`/api/v1/messaging/channels/${ch}/messages/pinned`,{credentials:'include'});
  const j2=await r2.json();
  return {unpinned:m.length, nowTotal:j2&&j2.total};
});
