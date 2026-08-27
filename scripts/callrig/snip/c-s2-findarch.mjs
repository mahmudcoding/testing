export default async ({page}) => page.evaluate(async ()=>{
  const ws='W4QCF1XTURESO01';
  const r=await fetch(`/api/v1/users/me/channels/archived?workspace_id=${ws}&limit=100`,{credentials:'include'});
  const j=await r.json(); const a=(j&&(j.channels||j.items))||[];
  const out=[];
  for (const c of (Array.isArray(a)?a:[]).slice(0,12)){
    const m=await fetch(`/api/v1/messaging/channels/${c.id}/messages?limit=2`,{credentials:'include'});
    if(m.status!==200) { out.push({name:c.name,status:m.status}); continue; }
    const mj=await m.json(); const list=(mj&&mj.messages)||[];
    if(list.length) return {picked:{name:c.name, id:c.id, msgId:list[list.length-1].id,
      body:String(list[list.length-1].body||'').slice(0,22)}, scanned:out.length+1};
    out.push({name:c.name, msgs:0});
  }
  return {picked:null, scanned:out.slice(0,6)};
});
