export default async ({page}) => page.evaluate(async ()=>{
  const ch='C4QCPRIVATE0001';
  const out={};
  const p=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},body:JSON.stringify({channel_id:ch,body:'QA-THRDEL parent'})});
  const pj=await p.json(); const pid=pj.id||pj.message?.id;
  await new Promise(r=>setTimeout(r,1500));
  const rp=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({channel_id:ch,body:'QA-THRDEL reply',parent_id:pid})});
  const rj=await rp.json(); const rid=rj.id||rj.message?.id;
  await new Promise(r=>setTimeout(r,2000));
  const before=await fetch(`/api/v1/messaging/messages/${pid}/thread?limit=20`,{credentials:'include'});
  const bj=await before.json();
  out.beforeDelete={status:before.status, replies:bj&&bj.replies?bj.replies.length:null,
                    parentBody:String(bj&&bj.parent&&bj.parent.body||'').slice(0,20)};
  const d=await fetch(`/api/v1/messaging/channels/${ch}/messages`,{method:'DELETE',credentials:'include',
    headers:{'content-type':'application/json'},body:JSON.stringify({message_ids:[pid]})});
  const dj=await d.json();
  out.deleteParent={status:d.status, ids:dj&&dj.deleted_ids};
  await new Promise(r=>setTimeout(r,2500));
  const after=await fetch(`/api/v1/messaging/messages/${pid}/thread?limit=20`,{credentials:'include'});
  let aj=null; try{aj=await after.json()}catch{}
  out.afterDelete={status:after.status, key:aj&&aj.key,
    replies:aj&&aj.replies?aj.replies.length:null,
    body:JSON.stringify(aj||'').slice(0,110)};
  // is the reply still reachable any other way?
  const list=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=20`,{credentials:'include'});
  const lj=await list.json(); const m=(lj&&lj.messages)||[];
  out.replyInChannelList=m.some(x=>x.id===rid);
  out.parentInChannelList=m.some(x=>x.id===pid);
  return out;
});
