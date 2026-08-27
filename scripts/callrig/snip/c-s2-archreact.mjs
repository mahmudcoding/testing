export default async ({page}) => page.evaluate(async ()=>{
  const ch='C4OXE10HFTU5W72', id='M4OXE138O5K27H1';
  const out={};
  const r=await fetch(`/api/v1/messaging/channels/${ch}/messages/${id}/reactions`,{method:'POST',
    credentials:'include',headers:{'content-type':'application/json'},body:JSON.stringify({emoji:'🎯'})});
  let j=null; try{j=await r.json()}catch{}
  out.reactionInArchived={status:r.status, key:j&&j.key,
    reactions:JSON.stringify(j&&j.reactions||j||'').slice(0,70)};
  const chk=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=3`,{credentials:'include'});
  const cj=await chk.json(); const m=(cj&&cj.messages)||[];
  const hit=m.find(x=>x.id===id);
  out.afterCheck={reactions:JSON.stringify(hit&&hit.reactions||[]).slice(0,60), pinned:hit&&hit.pinned};
  if(out.reactionInArchived.status===200)
    await fetch(`/api/v1/messaging/channels/${ch}/messages/${id}/reactions`,{method:'POST',
      credentials:'include',headers:{'content-type':'application/json'},body:JSON.stringify({emoji:'🎯'})});
  const chk2=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=3`,{credentials:'include'});
  const cj2=await chk2.json(); const m2=(cj2&&cj2.messages)||[];
  const hit2=m2.find(x=>x.id===id);
  out.afterCleanup={reactions:JSON.stringify(hit2&&hit2.reactions||[]).slice(0,40), pinned:hit2&&hit2.pinned};
  return out;
});
