export default async ({page}) => page.evaluate(async ()=>{
  const ch='C4QCPRIVATE0001';
  const out={};
  const p=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},body:JSON.stringify({channel_id:ch,body:'QA-THRDEL2 parent'})});
  const pj=await p.json(); const pid=pj.id||pj.message?.id;
  await new Promise(r=>setTimeout(r,1500));
  const rp=await fetch(`/api/v1/messaging/messages/${pid}/reply`,{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({channel_id:ch, body:'QA-THRDEL2 reply'})});
  let rj=null; try{rj=await rp.json()}catch{}
  out.replyCreate={status:rp.status, key:rj&&rj.key, id:(rj&&(rj.id||rj.message?.id)||'').slice(-5)};
  const rid=(rj&&(rj.id||rj.message?.id))||null;
  await new Promise(r=>setTimeout(r,2000));
  const before=await fetch(`/api/v1/messaging/messages/${pid}/thread?limit=20`,{credentials:'include'});
  const bj=await before.json();
  out.beforeDelete={status:before.status, replies:bj&&bj.replies?bj.replies.length:null};
  const d=await fetch(`/api/v1/messaging/channels/${ch}/messages`,{method:'DELETE',credentials:'include',
    headers:{'content-type':'application/json'},body:JSON.stringify({message_ids:[pid]})});
  const dj=await d.json();
  out.deleteParent={status:d.status, ids:dj&&dj.deleted_ids};
  await new Promise(r=>setTimeout(r,2500));
  const after=await fetch(`/api/v1/messaging/messages/${pid}/thread?limit=20`,{credentials:'include'});
  let aj=null; try{aj=await after.json()}catch{}
  out.afterDelete={status:after.status, key:aj&&aj.key,
    replies:aj&&aj.replies?aj.replies.length:null};
  const list=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=25`,{credentials:'include'});
  const lj=await list.json(); const m=(lj&&lj.messages)||[];
  out.replyStillInChannelList=rid?m.some(x=>x.id===rid):null;
  out.parentRow=(()=>{const h=m.find(x=>x.id===pid);
    return h?{present:true, body:String(h.body||'').slice(0,24), replyCount:h.reply_count}:{present:false};})();
  return out;
});
