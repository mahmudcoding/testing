export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/invites`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2200);
  return await page.evaluate(async () => {
    const W='W4QDF1XTURESO01';
    const get=async u=>{const r=await fetch(u,{credentials:'include'});
      const j=await r.json().catch(()=>null);
      return { s:r.status, a: Array.isArray(j)?j:((j&&(j.invites||j.items))||[]) };};
    const links=await get(`/api/v1/workspaces/${W}/invites`);
    const direct=await get(`/api/v1/workspaces/${W}/invites/direct`);
    const fmt=x=>({ id:x.id, status:x.status, uses:(x.used_count!=null?x.used_count+'/'+(x.max_uses??'∞'):null),
                    created:x.created_at, expires:x.expires_at });
    return { links:{ status:links.s, total:links.a.length,
                     pending:links.a.filter(x=>x.status==='pending').map(fmt) },
             direct:{ status:direct.s, total:direct.a.length,
                      pending:direct.a.filter(x=>x.status==='pending').map(fmt) } };
  });
};
