export default async ({page}) => {
  const id=process.env.QA_MID;
  return await page.evaluate(async(id)=>{const r=await fetch(`/api/v1/meeting/${id}/settings`,{credentials:'include'}); return {s:r.status, b:await r.text()};}, id);
};
