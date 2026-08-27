export default async ({ page }) => {
  const WS='W4QDF1XTURESO01', ALICE='U4QDALICE000001';
  const perm = process.env.QA_PERM || 'edit';
  return await page.evaluate(async ({WS,ALICE,perm}) => {
    const j = async (u,m,b) => { const r=await fetch(u,{method:m||'GET',credentials:'include',
      headers:b?{'content-type':'application/json'}:{}, body:b?JSON.stringify(b):undefined});
      const t=await r.text(); return {s:r.status,t:t.slice(0,300)}; };
    const created = await j(`/api/v1/workspaces/${WS}/roles`,'POST',
      { name:`QA D Probe ${perm}`, permissions:[`workspace.${WS}.${perm}`] });
    let id=null; try{ id=JSON.parse(created.t)?.id || JSON.parse(created.t)?.role?.id; }catch{}
    const assigned = id ? await j(`/api/v1/workspaces/${WS}/roles/assign`,'POST',{role_id:id,user_id:ALICE}) : null;
    return { perm, created, roleId:id, assigned };
  }, {WS,ALICE,perm});
};
