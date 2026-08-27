export default async ({ page }) => {
  const MODE = process.env.D2_MODE || 'assign';
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=company', { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(1500);
  return await page.evaluate(async (mode) => {
    const CO='O4QDF1XTURESO01', ALICE='U4QDALICE000001';
    const j = await (await fetch(`/api/v1/companies/${CO}/roles`,{credentials:'include'})).json();
    const arr = Array.isArray(j)?j:(j.roles||[]);
    const admin = arr.find(r=>r.name==='Admin');
    if (!admin) return { err:'Admin role not found' };
    const r = await fetch(`/api/v1/companies/roles/${mode==='assign'?'assign':'revoke'}`, { method:'POST',
      credentials:'include', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ role_id: admin.id, user_id: ALICE }) });
    return { mode, status:r.status, adminPermissions: admin.permissions };
  }, MODE);
};
