export default async ({page}) => {
  const id = process.env.QA_CALL;
  return await page.evaluate(async (id)=>{
    const r = await fetch(`/api/v1/meeting/${id}/end`,{method:'POST',credentials:'include'});
    let t=(await r.text()).slice(0,150);
    if (r.status>=400) { const r2 = await fetch(`/api/v1/meeting/${id}/leave`,{method:'POST',credentials:'include'}); t += ' || leave:'+r2.status; }
    return {s:r.status, t};
  }, id);
};
