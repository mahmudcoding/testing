export default async ({ page }) => {
  const ACTION = process.env.D2_ACTION;
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=company', { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(1200);
  return await page.evaluate(async (action) => {
    const CO='O4QDF1XTURESO01', ALICE='U4QDALICE000001';
    const call = async (m,u,b) => { const r=await fetch(u,{method:m,credentials:'include',
      headers:b?{'Content-Type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      const t=await r.text(); let j=null; try{j=JSON.parse(t);}catch{}; return {s:r.status,j}; };
    // clean any leftover sweep role
    const list = await call('GET', `/api/v1/companies/${CO}/roles`);
    const arr = Array.isArray(list.j)?list.j:(list.j.roles||[]);
    for (const r of arr) if (/^D2 sweep/.test(r.name)) {
      await call('POST','/api/v1/companies/roles/revoke',{role_id:r.id,user_id:ALICE});
      await call('DELETE', `/api/v1/companies/roles/${r.id}`);
    }
    if (action === 'CLEANUP') return { cleaned:true };
    const c = await call('POST', `/api/v1/companies/${CO}/roles`,
      { name:'D2 sweep', permissions:[`company.${CO}.${action}`] });
    const rid = c.j && c.j.id;
    const a = rid ? await call('POST','/api/v1/companies/roles/assign',{role_id:rid,user_id:ALICE}) : null;
    return { action, created:c.s, assigned:a&&a.s };
  }, ACTION);
};
