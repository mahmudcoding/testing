export default async ({ page }) => {
  const CO='O4QDF1XTURESO01', ALICE='U4QDALICE000001';
  const want = process.env.QA_PERM || 'privacy.manage';
  return await page.evaluate(async ({CO,ALICE,want}) => {
    const j=async(u,m,b)=>{const r=await fetch(u,{method:m||'GET',credentials:'include',
      headers:b?{'content-type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      return {s:r.status,t:(await r.text()).slice(0,200)};};
    const all=await (await fetch(`/api/v1/companies/${CO}/roles`,{credentials:'include'})).json();
    const probes=(all.roles||[]).filter(r=>/QA D CoProbe/.test(r.name));
    const target=probes.find(r=>(r.permissions||[]).some(p=>p.endsWith(want)));
    if(!target) return { err:'not found', probes: probes.map(p=>({n:p.name,perms:p.permissions})) };
    const a=await j('/api/v1/companies/roles/assign','POST',{role_id:target.id,user_id:ALICE});
    return { assigned:target.name, perms:target.permissions, res:a,
      allProbes: probes.map(p=>({n:p.name,perms:p.permissions})) };
  }, {CO,ALICE,want});
};
