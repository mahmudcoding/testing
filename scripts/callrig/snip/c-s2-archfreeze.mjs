export default async ({page}) => page.evaluate(async ()=>{
  const ch='C4QCARCHIVE0001';
  const out={};
  const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=3`,{credentials:'include'});
  const j=await r.json(); const m=(j&&j.messages)||[];
  out.readStatus=r.status; out.messages=m.length;
  if(!m.length) return out;
  const id=m[m.length-1].id;
  out.messageId=id.slice(-5);
  // 1. send
  const send=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},body:JSON.stringify({channel_id:ch,body:'QA-ARCHFREEZE'})});
  let sj=null; try{sj=await send.json()}catch{}
  out.send={status:send.status, key:sj&&sj.key};
  // 2. reaction
  const react=await fetch(`/api/v1/messaging/messages/${id}/reactions`,{method:'POST',
    credentials:'include',headers:{'content-type':'application/json'},
    body:JSON.stringify({emoji:'🎯'})});
  let rj=null; try{rj=await react.json()}catch{}
  out.reaction={status:react.status, key:rj&&rj.key};
  // 3. pin
  const pin=await fetch(`/api/v1/messaging/channels/${ch}/messages/${id}/pin`,{method:'POST',
    credentials:'include',headers:{'content-type':'application/json'},
    body:JSON.stringify({pin:true})});
  let pj=null; try{pj=await pin.json()}catch{}
  out.pin={status:pin.status, key:pj&&pj.key};
  // clean up whatever went through
  if(out.pin.status===200) await fetch(`/api/v1/messaging/channels/${ch}/messages/${id}/pin`,{method:'POST',
    credentials:'include',headers:{'content-type':'application/json'},body:JSON.stringify({pin:false})});
  if(out.reaction.status===200) await fetch(`/api/v1/messaging/messages/${id}/reactions`,{method:'DELETE',
    credentials:'include',headers:{'content-type':'application/json'},body:JSON.stringify({emoji:'🎯'})});
  return out;
});
