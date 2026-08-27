export default async ({page}) => page.evaluate(async ()=>{
  const ch='C4QCPRIVATE0001', tag='QA-PIN-'+Math.random().toString(36).slice(2,6);
  const J=async(u,o)=>{const r=await fetch(u,{credentials:'include',...o});
    let b=null;try{b=await r.json()}catch{} return {s:r.status,b}};
  const p=await J('/api/v1/messaging/messages',{method:'POST',
    headers:{'content-type':'application/json'},body:JSON.stringify({channel_id:ch,body:tag})});
  const mid=p.b?.id||p.b?.message?.id;
  await new Promise(r=>setTimeout(r,2000));
  const pin=await J(`/api/v1/messaging/channels/${ch}/messages/${mid}/pin`,{method:'POST',
    headers:{'content-type':'application/json'},body:JSON.stringify({pin:true})});
  return {tag,mid,post:p.s,pin:pin.s,key:pin.b?.key||null};
});
