export default async ({page}) => page.evaluate(async (mid)=>{
  const ch='C4QCGENERAL0001';
  const r=await fetch(`/api/v1/messaging/channels/${ch}/messages/${mid}/pin`,
    {method:'POST',credentials:'include',headers:{'content-type':'application/json'},
     body:JSON.stringify({pin:true})});
  let b=null; try{b=await r.json()}catch{}
  return {status:r.status, body:JSON.stringify(b).slice(0,160)};
}, process.env.QA_MID);
