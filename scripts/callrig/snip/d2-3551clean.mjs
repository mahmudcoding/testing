export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/members`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  return await page.evaluate(async () => {
    const W='W4QDF1XTURESO01', OUT='U4QDOUTSIDER001';
    const post=async(u,b)=>{const r=await fetch(u,{method:'POST',credentials:'include',
      headers:b?{'Content-Type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      return {s:r.status, t:(await r.text()).slice(0,120)};};
    const out={};
    out.kick = await post('/api/v1/workspaces/kick',{workspace_id:W, user_id:OUT});
    // revoke any still-pending invite
    const g=async u=>{const r=await fetch(u,{credentials:'include'});const j=await r.json().catch(()=>null);
      return Array.isArray(j)?j:((j&&(j.invites||j.items))||[]);};
    out.revoked=[];
    for (const inv of await g(`/api/v1/workspaces/${W}/invites`))
      if (inv.status==='pending') out.revoked.push(await post(`/api/v1/workspaces/invites/${inv.id}/revoke`));
    await new Promise(r=>setTimeout(r,1200));
    const m=await g(`/api/v1/workspaces/${W}/members?limit=50`);
    const l=await g(`/api/v1/workspaces/${W}/invites`);
    out.workspaceMembersNow = m.length;
    out.stillHasOutsider = m.some(x=>(x.user_id||x.id)===OUT);
    out.pendingInvites = l.filter(x=>x.status==='pending').length;
    return out;
  });
};
