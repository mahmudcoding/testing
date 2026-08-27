export default async ({page}) => {
  const act=process.env.QA_ACT, ch=process.env.QA_CH, uid=process.env.QA_UID;
  return page.evaluate(async ({act,ch,uid})=>{
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json().catch(()=>({}));
    const who=me.email||(me.user&&me.user.email)||JSON.stringify(me).slice(0,60);
    if(act==='who') return {me:who};
    const r=await fetch(`/api/v1/channels/members/${act}`,{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, user_id:uid})});
    const t=await r.text();
    return {actor:who, act, status:r.status, body:t.slice(0,200)};
  }, {act,ch,uid});
};
