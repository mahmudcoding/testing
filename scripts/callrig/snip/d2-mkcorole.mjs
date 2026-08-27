export default async ({ page }) => {
  const CO='O4QDF1XTURESO01', ALICE='U4QDALICE000001';
  const perm = process.env.QA_PERM || 'role.get';
  return await page.evaluate(async ({CO,ALICE,perm}) => {
    const j=async(u,m,b)=>{const r=await fetch(u,{method:m||'GET',credentials:'include',
      headers:b?{'content-type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      return {s:r.status,t:(await r.text()).slice(0,260)};};
    const created=await j(`/api/v1/companies/${CO}/roles`,'POST',
      {name:`QA D CoProbe ${perm}`, permissions:[`company.${CO}.${perm}`]});
    let id=null; try{ id=JSON.parse(created.t)?.id; }catch{}
    const assigned = id ? await j(`/api/v1/companies/${CO}/roles/assign`,'POST',{role_id:id,user_id:ALICE}) : null;
    return { perm, created, roleId:id, assigned };
  }, {CO,ALICE,perm});
};
