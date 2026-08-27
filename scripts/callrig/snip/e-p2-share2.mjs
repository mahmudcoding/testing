const GEN='C4QEGENERAL0001', FID='F4OXKZJW9QAOUR6';
export default async ({page}) => await page.evaluate(async ({GEN,FID}) => {
  const r=await fetch(`/api/v1/files/${FID}/shares`,{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({type:'channel', target_id:GEN})});
  return {status:r.status, resp:(await r.text()).slice(0,140)};
}, {GEN,FID});
