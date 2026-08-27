export default async ({ page }) => {
  const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/invites`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  return await page.evaluate(async ([W,CO]) => {
    const call=async(m,u,b)=>{const r=await fetch(u,{method:m,credentials:'include',
      headers:b?{'Content-Type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      const t=await r.text(); let j=null; try{j=JSON.parse(t)}catch{}; return {s:r.status,j,t:t.slice(0,150)};};
    const list=async u=>{const r=await call('GET',u); const j=r.j;
      return Array.isArray(j)?j:((j&&(j.roles||j.items))||[]);};
    const co=await list(`/api/v1/companies/${CO}/roles`);
    const guest=co.find(r=>r.name==='Guest');           // an ordinary company role, not a system one
    if(!guest) return {err:'no Guest company role'};
    const inv=await call('POST','/api/v1/workspaces/invites',
      {workspace_id:W, role_ids:[guest.id], max_uses:1});
    const out={ usedCompanyRole:{name:guest.name, scope:'company'}, invitePost:inv.s,
                body: inv.t.slice(0,150) };
    if (inv.j && inv.j.id) out.revoked=(await call('POST',`/api/v1/workspaces/invites/${inv.j.id}/revoke`)).s;
    return out;
  }, ['W4QDF1XTURESO01','O4QDF1XTURESO01']);
};
