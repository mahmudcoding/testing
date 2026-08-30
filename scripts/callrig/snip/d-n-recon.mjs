export default async ({page}) => {
  const id=process.env.QA_MID;
  return await page.evaluate(async(id)=>{
    const r=await fetch(`/api/v1/meeting/${id}/settings`,{method:'PATCH',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({recording_enabled:true})});
    return {s:r.status, b:(await r.text()).slice(0,160)};}, id);
};
