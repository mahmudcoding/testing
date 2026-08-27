export default async ({page}) => page.evaluate(async ()=>{
  const ch='C4QCGENERAL0001';
  const p=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({channel_id:ch, body:'QA-2650 last message '+Math.random().toString(36).slice(2,5)})});
  const j=await p.json(); const id=j.id||j.message?.id;
  await new Promise(r=>setTimeout(r,14000));      // let the observer's sidebar reorder
  const d=await fetch(`/api/v1/messaging/channels/${ch}/messages`,{method:'DELETE',
    credentials:'include',headers:{'content-type':'application/json'},
    body:JSON.stringify({message_ids:[id]})});
  const dj=await d.json();
  return {posted:p.status, id, deleted:d.status, deletedIds:dj&&dj.deleted_ids};
});
