export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/invites`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  return await page.evaluate(async () => {
    const W='W4QDF1XTURESO01';
    const get=async u=>{const r=await fetch(u,{credentials:'include'});
      const j=await r.json().catch(()=>null);
      return Array.isArray(j)?j:((j&&(j.invites||j.items))||[]);};
    const post=async u=>{const r=await fetch(u,{method:'POST',credentials:'include'});
      return r.status;};
    const out={ revoked:[] };
    for (const [kind,url] of [['link',`/api/v1/workspaces/${W}/invites`],
                              ['direct',`/api/v1/workspaces/${W}/invites/direct`]]) {
      for (const inv of await get(url)) {
        if (inv.status!=='pending') continue;
        const s = await post(`/api/v1/workspaces/invites/${inv.id}/revoke`);
        out.revoked.push(`${kind} ${inv.id} -> ${s}`);
      }
    }
    await new Promise(r=>setTimeout(r,900));
    const l=await get(`/api/v1/workspaces/${W}/invites`);
    const d=await get(`/api/v1/workspaces/${W}/invites/direct`);
    out.pendingAfter = { links:l.filter(x=>x.status==='pending').length,
                         direct:d.filter(x=>x.status==='pending').length,
                         totals:{links:l.length, direct:d.length} };
    return out;
  });
};
