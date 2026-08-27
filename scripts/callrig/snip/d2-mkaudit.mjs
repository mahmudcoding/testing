export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=company', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2200);
  return await page.evaluate(async () => {
    const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01', ALICE='U4QDALICE000001';
    const call = async (m,u,b) => { const r=await fetch(u,{method:m,credentials:'include',
      headers:b?{'Content-Type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      const t=await r.text(); let j=null; try{j=JSON.parse(t);}catch{}; return {s:r.status,j,raw:t.slice(0,160)}; };
    const out={};
    // revoke + delete the invite probe role
    const wr = await call('GET', `/api/v1/workspaces/${W}/roles`);
    const arr = Array.isArray(wr.j)?wr.j:(wr.j.roles||[]);
    const inv = arr.find(r=>r.name==='D2 reverify invite');
    if (inv) { out.revokeInvite = await call('POST', `/api/v1/workspaces/${W}/roles/revoke`, { role_id: inv.id, user_id: ALICE });
               out.deleteInvite = await call('DELETE', `/api/v1/workspaces/${W}/roles/${inv.id}`); }
    // create the company audit.view probe role
    out.createAudit = await call('POST', `/api/v1/companies/${CO}/roles`,
      { name: 'D2 reverify audit', permissions: [`company.${CO}.audit.view`] });
    const rid = out.createAudit.j && out.createAudit.j.id;
    out.roleId = rid;
    if (rid) out.assignAudit = await call('POST', '/api/v1/companies/roles/assign', { role_id: rid, user_id: ALICE });
    return out;
  });
};
