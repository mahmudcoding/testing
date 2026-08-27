export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/invites`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  return await page.evaluate(async () => {
    const W='W4QDF1XTURESO01';
    const r=await fetch('/api/v1/workspaces/invites',{method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({workspace_id:W, role_ids:[], max_uses:1})});
    const j=await r.json().catch(()=>null);
    const m=await fetch(`/api/v1/workspaces/${W}/members?limit=50`,{credentials:'include'});
    const mj=await m.json().catch(()=>null);
    const arr=Array.isArray(mj)?mj:((mj&&(mj.members||mj.items))||[]);
    return { invite:{status:r.status, id:j&&j.id, token:j&&j.token},
             workspaceMembersNow: arr.length,
             names: arr.map(x=>x.name).slice(0,10) };
  });
};
