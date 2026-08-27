export default async ({page}) => {
  const M=process.env.QA_MEET, target=process.env.QA_TARGET, act=process.env.QA_ACT||'pin';
  return await page.evaluate(async ({M,target,act})=>{
    if(act==='unpin'){ const r=await fetch('/api/v1/meeting/'+M+'/pin?breakout_room_id=',{method:'DELETE',credentials:'include'}); return {unpin:r.status}; }
    const r=await fetch('/api/v1/meeting/'+M+'/pin',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({target_type:'participant',target_user_id:target})});
    return {pin:r.status, body:(await r.text()).slice(0,200)};
  }, {M,target,act});
};
