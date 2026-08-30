export default async ({page}) => {
  const id=process.env.QA_MID;
  return await page.evaluate(async (id)=>{
    const r = await fetch(`/api/v1/meeting/${id}`,{method:'PATCH',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({requires_approval:false})});
    const b=await r.text();
    const g = await fetch(`/api/v1/meeting/${id}`,{credentials:'include'});
    return {patch:r.status, body:b.slice(0,400), requires:(await g.text()).match(/requires_approval":\w+/)?.[0]};
  }, id);
};
