export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=company', { waitUntil:'networkidle' });
  await page.waitForTimeout(2500);
  return await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01', W='W4QDF1XTURESO01';
    const g=async u=>{const r=await fetch(u,{credentials:'include'});const j=await r.json();
      return Array.isArray(j)?j:(j.roles||j.items||[]);};
    const co=await g(`/api/v1/companies/${CO}/roles`);
    const ws=await g(`/api/v1/workspaces/${W}/roles`);
    const shape=a=>a.map(r=>({ name:r.name, system:r.is_system===true, guest:r.is_guest===true,
      permissions:(r.permissions||[]).map(p=>p.replace(CO,'<CO>').replace(W,'<WS>')) }));
    return { company: shape(co), workspace: shape(ws) };
  });
};
