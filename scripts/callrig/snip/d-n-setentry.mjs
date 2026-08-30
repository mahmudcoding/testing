export default async ({page}) => {
  const id=process.env.QA_MID;
  return await page.evaluate(async (id)=>{
    const r = await fetch(`/api/v1/meeting/${id}/settings`,{method:'PATCH',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({entry_mode:'open'})});
    const b = await r.text();
    const g = await fetch(`/api/v1/meeting/${id}`,{credentials:'include'});
    return {patch:r.status, body:b.slice(0,300), get:(await g.text()).slice(0,900)};
  }, id);
};
