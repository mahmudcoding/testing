export default async ({ page }) => {
  const CO='O4QDF1XTURESO01', ALICE='U4QDALICE000001';
  return await page.evaluate(async ({CO,ALICE}) => {
    const j=async(u,m,b)=>{const r=await fetch(u,{method:m||'GET',credentials:'include',
      headers:b?{'content-type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      return {s:r.status,t:(await r.text()).slice(0,200)};};
    const all=await (await fetch(`/api/v1/companies/${CO}/roles`,{credentials:'include'})).json();
    const probe=(all.roles||[]).find(r=>/QA D CoProbe/.test(r.name));
    if(!probe) return {err:'probe role not found'};
    const a=await j('/api/v1/companies/roles/assign','POST',{role_id:probe.id,user_id:ALICE});
    return { role:probe.name, perms:probe.permissions, assign:a };
  }, {CO,ALICE});
};
