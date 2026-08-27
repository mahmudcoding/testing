export default async ({page}) => {
  const id=process.env.QA_CHID;
  return page.evaluate(async(id)=>{
    const r=await fetch(`/api/v1/channels/${id}/archive`,{method:'POST',credentials:'include'});
    return {status:r.status, body:(await r.text()).slice(0,80)};
  }, id);
};
