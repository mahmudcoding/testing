export default async ({page}) => {
  const WS='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/audit-log`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  return await page.evaluate(async ({WS,CO})=>{
    const g=async u=>{const r=await fetch(u,{credentials:'include'}); const j=await r.json(); return Array.isArray(j)?j:(j.entries||[]);};
    // walk the company log with a big limit to get as much as possible
    const co=await g(`/api/v1/companies/${CO}/admin/audit-log?limit=100`);
    const ws=await g(`/api/v1/workspaces/${WS}/admin/audit-log?limit=100`);
    const wsIds=new Set(ws.map(e=>e.id));
    const companyScope=co.filter(e=>e.scope_type==='company');
    const inWorkspaceLog=companyScope.filter(e=>wsIds.has(e.id));
    // what the page requested on load
    return {
      companyLogSample: co.length, workspaceLogSample: ws.length,
      companyScopeCount: companyScope.length,
      companyScopeDetail: companyScope.map(e=>({id:e.id, action:e.action, scope:e.scope_type, at:e.created_at})),
      companyScopeAlsoInWorkspaceLog: inWorkspaceLog.length,
      workspaceLogScopeTypes: [...new Set(ws.map(e=>e.scope_type))]
    };
  }, {WS,CO});
};
