export default async ({page}) => {
  const ch='C4QCGENERAL0001';
  return page.evaluate(async(ch)=>{
    const r=await fetch(`/api/v1/notifications/channels/${ch}/mute`,{method:'DELETE',credentials:'include'});
    return {status:r.status, body:(await r.text()).slice(0,80)};
  }, ch);
};
