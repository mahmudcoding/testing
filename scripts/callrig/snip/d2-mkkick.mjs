export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=company', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2200);
  return await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01', ALICE='U4QDALICE000001';
    const call = async (m,u,b) => { const r=await fetch(u,{method:m,credentials:'include',
      headers:b?{'Content-Type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      const t=await r.text(); let j=null; try{j=JSON.parse(t);}catch{}; return {s:r.status,j,raw:t.slice(0,140)}; };
    const out={};
    const cr = await call('GET', `/api/v1/companies/${CO}/roles`);
    const arr = Array.isArray(cr.j)?cr.j:(cr.j.roles||[]);
    const aud = arr.find(r=>r.name==='D2 reverify audit');
    if (aud) out.revokeAudit = await call('POST', '/api/v1/companies/roles/revoke', { role_id: aud.id, user_id: ALICE });
    out.createKick = await call('POST', `/api/v1/companies/${CO}/roles`,
      { name: 'D2 reverify kick', permissions: [`company.${CO}.member.kick`, `company.${CO}.member.view`] });
    const rid = out.createKick.j && out.createKick.j.id;
    if (rid) out.assignKick = await call('POST', '/api/v1/companies/roles/assign', { role_id: rid, user_id: ALICE });
    out.roleId = rid;
    return out;
  });
};
