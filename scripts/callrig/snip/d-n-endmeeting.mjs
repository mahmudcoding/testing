export default async ({page}) => {
  const id=process.env.QA_MID;
  return await page.evaluate(async(id)=>{
    const r=await fetch(`/api/v1/meeting/${id}/end`,{method:'POST',credentials:'include'});
    const b=(await r.text()).slice(0,160);
    const a=await fetch('/api/v1/workspace/W4QDF1XTURESO01/meetings/active',{credentials:'include'});
    return {end:r.status, body:b, active:(await a.text()).slice(0,200)};
  }, id);
};
