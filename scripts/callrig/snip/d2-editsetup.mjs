export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=company', { waitUntil:'networkidle' });
  await page.waitForTimeout(2500);
  return await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01', ALICE='U4QDALICE000001';
    const call = async (m,u,b) => { const r=await fetch(u,{method:m,credentials:'include',
      headers:b?{'Content-Type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      const t=await r.text(); let j=null; try{j=JSON.parse(t);}catch{}; return {s:r.status,j}; };
    const c = await call('POST', `/api/v1/companies/${CO}/roles`,
      { name: 'D2 edit probe', permissions: [`company.${CO}.audit.view`, `company.${CO}.member.view`] });
    const rid = c.j && c.j.id;
    const a = rid ? await call('POST','/api/v1/companies/roles/assign',{ role_id:rid, user_id:ALICE }) : null;
    // read the role back to confirm what it holds
    const list = await call('GET', `/api/v1/companies/${CO}/roles`);
    const arr = Array.isArray(list.j)?list.j:(list.j.roles||[]);
    const mine = arr.find(x=>x.name==='D2 edit probe');
    return { created:c.s, roleId:rid, assigned:a&&a.s, permissionsNow: mine && mine.permissions };
  });
};
