export default async ({page}) => {
  const id=process.env.QA_EV;
  return await page.evaluate(async (id)=>{
    const r=await fetch(`/api/v1/calendar/meetings/${id}`,{method:'DELETE',credentials:'include'});
    return {s:r.status, t:(await r.text()).slice(0,120)};
  }, id);
};
