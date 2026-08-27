export default async ({page}) => {
  const ch='C4QCGENERAL0001';
  const tag='QA-PIN-'+Math.random().toString(36).slice(2,6);
  return page.evaluate(async ({ch,tag})=>{
    const J=async(u,o)=>{const r=await fetch(u,{credentials:'include',...o});
      let b=null; try{b=await r.json()}catch{} return {s:r.status,b}};
    const post=await J('/api/v1/messaging/messages',{method:'POST',
      headers:{'content-type':'application/json'},body:JSON.stringify({channel_id:ch,body:tag})});
    const mid=post.b?.id||post.b?.message?.id;
    await new Promise(r=>setTimeout(r,1500));
    const pin=await J(`/api/v1/messaging/channels/${ch}/messages/${mid}/pin`,{method:'POST'});
    return {tag, mid, postStatus:post.s, pinStatus:pin.s,
            pinKey:pin.b?.key||null, pinMsg:(pin.b?.message||'').slice(0,80)};
  },{ch,tag});
};
