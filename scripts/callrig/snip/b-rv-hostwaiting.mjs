export default async ({page}) => {
  const mid=process.env.QA_MID;
  return await page.evaluate(async(id)=>{
    const r=await fetch(`/api/v1/meeting/${id}/waiting`,{credentials:'include'});
    let b=null; try{b=await r.json();}catch{}
    return {url:location.href, status:r.status, body:JSON.stringify(b).slice(0,400)};
  }, mid);
};
