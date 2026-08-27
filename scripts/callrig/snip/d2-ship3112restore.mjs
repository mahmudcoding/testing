export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/members', { waitUntil:'networkidle' });
  await page.waitForTimeout(1800);
  return await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01', W='W4QDF1XTURESO01', ALICE='U4QDALICE000001';
    const post=async(u,b)=>{const r=await fetch(u,{method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
      return {s:r.status,t:(await r.text()).slice(0,120)};};
    const del=async u=>{const r=await fetch(u,{method:'DELETE',credentials:'include'});
      return {s:r.status,t:(await r.text()).slice(0,120)};};
    const out={};
    out.assignBack = await post('/api/v1/companies/roles/assign',{role_id:'R4QDCOMPMEMBER1',user_id:ALICE});
    out.revokeTemp = await post(`/api/v1/workspaces/${W}/roles/revoke`,{role_id:'R4OXA06D1DDOYDY',user_id:ALICE});
    out.deleteTemp = await del(`/api/v1/workspaces/${W}/roles/R4OXA06D1DDOYDY`);
    await new Promise(r=>setTimeout(r,1000));
    const chk=await fetch(`/api/v1/companies/${CO}/members`,{credentials:'include'});
    const j=await chk.json().catch(()=>null);
    const ms=Array.isArray(j)?j:((j&&(j.members||j.items))||[]);
    const a=ms.find(m=>(m.user_id||m.id)===ALICE);
    out.aliceRolesNow = a? (a.roles||[]).map(r=>r.name) : 'row-missing';
    const wr=await fetch(`/api/v1/workspaces/${W}/roles`,{credentials:'include'});
    const wj=await wr.json().catch(()=>null);
    const wl=Array.isArray(wj)?wj:((wj&&(wj.roles||wj.items))||[]);
    out.workspaceRolesNow = wl.map(x=>x.name);
    return out;
  });
};
