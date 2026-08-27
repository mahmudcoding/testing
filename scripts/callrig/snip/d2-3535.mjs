export default async ({ page }) => {
  const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
  const calls=[];
  page.on('request', r => { const u=r.url().replace(/^https?:\/\/[^/]+/,'');
    if(/admin\/audit-log/.test(u)) calls.push(u.slice(0,70)); });
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/audit-log`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3200);
  const data = await page.evaluate(`(async()=>{
    const g=async u=>{const r=await fetch(u,{credentials:'include'});const j=await r.json().catch(()=>null);
      return Array.isArray(j)?j:((j&&j.entries)||[]);};
    const co=await g('/api/v1/companies/O4QDF1XTURESO01/admin/audit-log?limit=100');
    const ws=await g('/api/v1/workspaces/W4QDF1XTURESO01/admin/audit-log?limit=100');
    const wsIds=new Set(ws.map(e=>e.id));
    const onlyInCompany=co.filter(e=>!wsIds.has(e.id));
    const byAction={}; onlyInCompany.forEach(e=>byAction[e.action]=(byAction[e.action]||0)+1);
    return { companyEntries:co.length, workspaceEntries:ws.length,
             presentOnlyInCompanyLog:onlyInCompany.length, byAction };})()`);
  return { requestsScreenMade: calls, ...data };
};
