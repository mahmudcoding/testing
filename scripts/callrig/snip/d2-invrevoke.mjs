export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/invites`, { waitUntil:'networkidle' });
  await page.waitForTimeout(1800);
  return await page.evaluate(async () => {
    const call=async(m,u)=>{const r=await fetch(u,{method:m,credentials:'include'});
      return {s:r.status, t:(await r.text()).slice(0,110)};};
    const rev = await call('POST','/api/v1/workspaces/invites/I4OXC23EJV42QAA/revoke');
    const list = await fetch('/api/v1/workspaces/invites?workspace_id=W4QDF1XTURESO01',{credentials:'include'});
    const j = await list.json().catch(()=>null);
    const arr = Array.isArray(j)?j:((j&&(j.invites||j.items))||[]);
    return { revoke:rev, liveInvites: arr.filter(x=>x.status==='pending'||x.status==='active').length,
             total: arr.length };
  });
};
