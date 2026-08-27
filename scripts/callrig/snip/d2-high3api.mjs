export default async ({ page }) => {
  const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/roles?scope=company`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  return await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01';
    const j=async(m,u,b)=>{const r=await fetch(u,{method:m,credentials:'include',
      headers:b?{'Content-Type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      const t=await r.text(); let p=null; try{p=JSON.parse(t)}catch{}; return {s:r.status,b:t.slice(0,90),id:p&&p.id};};
    const out={};
    out.roleGet  = await j('GET',  `/api/v1/companies/${CO}/roles`);
    const post   = await j('POST', `/api/v1/companies/${CO}/roles`, {name:'D2H probe roundtrip', permissions:[]});
    out.rolePost = {s:post.s};
    if (post.id) out.roleDelete = await j('DELETE', `/api/v1/companies/roles/${post.id}`);
    return out;
  });
};
