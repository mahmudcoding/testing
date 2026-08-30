export default async ({ page }) => {
  const ID=process.env.QA_MEETING;
  return await page.evaluate(async (id)=>{
    const r=await fetch(`/api/v1/meeting/${id}`,{credentials:'include'});
    const j=await r.json().catch(()=>null);
    const r2=await fetch(`/api/v1/meeting/${id}`,{method:'PATCH',credentials:'include',
      headers:{'content-type':'application/json'}, body: JSON.stringify({entry_mode:'open'})});
    const j2=await r2.json().catch(()=>null);
    const r3=await fetch(`/api/v1/meeting/${id}`,{credentials:'include'});
    const j3=await r3.json().catch(()=>null);
    return {status:r.status, before:JSON.stringify(j).slice(0,900), patch:r2.status, patchBody:JSON.stringify(j2).slice(0,300), after:JSON.stringify(j3).slice(0,900)};
  }, ID);
};
