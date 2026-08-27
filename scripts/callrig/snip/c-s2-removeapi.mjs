export default async ({page}) => page.evaluate(async ()=>{
  const ch='C4QCPRIVATE0001', bob='U4QCBOB00000001';
  const J=async(u,body)=>{const r=await fetch(u,{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},body:JSON.stringify(body)});
    let b=null; try{b=await r.json()}catch{} return {s:r.status,key:b&&b.key};};
  const count=async()=>{const r=await fetch(`/api/v1/channels/${ch}/members`,{credentials:'include'});
    const j=await r.json(); const a=(j&&(j.members||j))||[];
    return {n:Array.isArray(a)?a.length:null,
            names:(Array.isArray(a)?a:[]).map(m=>m.display_name||m.user_id).slice(0,5)};};
  const before=await count();
  const rem=await J('/api/v1/channels/members/remove',{channel_id:ch,user_id:bob});
  await new Promise(r=>setTimeout(r,2000));
  const mid=await count();
  const add=await J('/api/v1/channels/members/add',{channel_id:ch,user_id:bob});
  await new Promise(r=>setTimeout(r,2000));
  const after=await count();
  return {before, removeCall:rem, afterRemove:mid, addCall:add, afterRestore:after};
});
