export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=company', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  return await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01', W='W4QDF1XTURESO01';
    const get = async u => { try { const r=await fetch(u,{credentials:'include'}); const t=await r.text();
      let j=null; try{j=JSON.parse(t);}catch{} return { s:r.status, j, raw:t.slice(0,120) }; } catch(e){ return {s:0,err:String(e).slice(0,60)}; } };
    const co = await get(`/api/v1/companies/${CO}/roles`);
    const ws = await get(`/api/v1/workspaces/${W}/roles`);
    const shape = r => { if (!r.j) return r.raw; const arr = Array.isArray(r.j)?r.j:(r.j.roles||r.j.items||[]);
      return arr.map(x => ({ id:x.id, name:x.name, sys:x.is_system, perms:(x.permissions||[]).length })); };
    return { companyRoles: { status: co.s, roles: shape(co) }, workspaceRoles: { status: ws.s, roles: shape(ws) } };
  });
};
