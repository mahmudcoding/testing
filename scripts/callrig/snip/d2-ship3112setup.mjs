export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/members', { waitUntil:'networkidle' });
  await page.waitForTimeout(1800);
  return await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01', ALICE='U4QDALICE000001';
    const post=async(u,b)=>{const r=await fetch(u,{method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
      return {s:r.status, t:(await r.text()).slice(0,140)};};
    const revoke = await post('/api/v1/companies/roles/revoke',{role_id:'R4QDCOMPMEMBER1',user_id:ALICE});
    await new Promise(r=>setTimeout(r,900));
    const chk=await fetch(`/api/v1/companies/${CO}/members`,{credentials:'include'});
    const j=await chk.json().catch(()=>null);
    const ms=Array.isArray(j)?j:((j&&(j.members||j.items))||[]);
    const a=ms.find(m=>(m.user_id||m.id)===ALICE);
    return { revoke, aliceRolesNow: a? (a.roles||[]).map(r=>r.name) : 'row-missing' };
  });
};
