export default async ({ page }) => {
  const ID=process.env.QA_MEETING;
  return await page.evaluate(async (id)=>{
    const r2=await fetch(`/api/v1/meeting/${id}`,{method:'PATCH',credentials:'include',
      headers:{'content-type':'application/json'}, body: JSON.stringify({requires_approval:false})});
    const j3=await (await fetch(`/api/v1/meeting/${id}`,{credentials:'include'})).json().catch(()=>null);
    return {patch:r2.status, requires_approval: j3?.meeting?.requires_approval};
  }, ID);
};
