export default async ({page}) => await page.evaluate(async(rid)=>{
  const r = await fetch(`/api/v1/meeting/recordings/${rid}/access`,{method:'PUT',credentials:'include',
    headers:{'Content-Type':'application/json'}, body: JSON.stringify({access_scope:'participants', viewer_ids:[]})});
  return {status:r.status, body:(await r.text()).slice(0,120)};
}, process.env.QA_RID);
