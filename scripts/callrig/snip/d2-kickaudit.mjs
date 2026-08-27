export default async ({ page }) => {
  const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/audit-log`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2200);
  return await page.evaluate(async () => {
    const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
    const get=async u=>{const r=await fetch(u,{credentials:'include'});
      const j=await r.json().catch(()=>null); return {s:r.status, j};};
    const rows=j=>Array.isArray(j)?j:((j&&j.entries)||[]);
    const co=await get(`/api/v1/companies/${CO}/admin/audit-log?limit=100`);
    const ws=await get(`/api/v1/workspaces/${W}/admin/audit-log?limit=100`);
    const pick=(r,re)=>rows(r.j).filter(e=>re.test(e.action||''))
      .map(e=>({action:e.action, at:e.created_at,
                target:(e.target_name||e.target_id||'').slice(-14)}));
    return {
      companyLog: { status:co.s, total:rows(co.j).length,
        memberEvents: pick(co,/member_removed|member_joined|kick/i).slice(0,8),
        distinctActions:[...new Set(rows(co.j).map(e=>e.action))] },
      workspaceLog: { status:ws.s, total:rows(ws.j).length,
        memberEvents: pick(ws,/member_removed|member_joined|kick/i).slice(0,8),
        distinctActions:[...new Set(rows(ws.j).map(e=>e.action))] }
    };
  });
};
