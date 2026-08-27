export default async ({page}) => page.evaluate(async ()=>{
  const ch='C4OXE10HFTU5W72', id='M4OXE138O5K27H1';
  const out={channel:'archived throwaway with one message'};
  const send=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},body:JSON.stringify({channel_id:ch,body:'QA-ARCHFREEZE2'})});
  let sj=null; try{sj=await send.json()}catch{}
  out.send={status:send.status, key:sj&&sj.key};
  const react=await fetch(`/api/v1/messaging/messages/${id}/reactions`,{method:'POST',
    credentials:'include',headers:{'content-type':'application/json'},body:JSON.stringify({emoji:'🎯'})});
  let rj=null; try{rj=await react.json()}catch{}
  out.reaction={status:react.status, key:rj&&rj.key};
  const pin=await fetch(`/api/v1/messaging/channels/${ch}/messages/${id}/pin`,{method:'POST',
    credentials:'include',headers:{'content-type':'application/json'},body:JSON.stringify({pin:true})});
  let pj=null; try{pj=await pin.json()}catch{}
  out.pin={status:pin.status, key:pj&&pj.key};
  // verify what actually landed, then undo
  const chk=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=3`,{credentials:'include'});
  const cj=await chk.json(); const m=(cj&&cj.messages)||[];
  const hit=m.find(x=>x.id===id);
  out.stateNow={reactions:JSON.stringify(hit&&hit.reactions||[]).slice(0,40),
                pinned:hit&&hit.pinned, messagesInChannel:m.length};
  if(out.pin.status===200) await fetch(`/api/v1/messaging/channels/${ch}/messages/${id}/pin`,{method:'POST',
    credentials:'include',headers:{'content-type':'application/json'},body:JSON.stringify({pin:false})});
  if(out.reaction.status===200) await fetch(`/api/v1/messaging/messages/${id}/reactions`,{method:'DELETE',
    credentials:'include',headers:{'content-type':'application/json'},body:JSON.stringify({emoji:'🎯'})});
  return out;
});
