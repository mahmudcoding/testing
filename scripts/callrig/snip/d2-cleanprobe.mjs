export default async ({ page }) => {
  const WS='W4QDF1XTURESO01', ALICE='U4QDALICE000001';
  return await page.evaluate(async ({WS,ALICE}) => {
    const j=async(u,m,b)=>{const r=await fetch(u,{method:m||'GET',credentials:'include',
      headers:b?{'content-type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      return {s:r.status,t:(await r.text()).slice(0,160)};};
    const list=await j(`/api/v1/workspaces/${WS}/roles`);
    const probes=(JSON.parse(list.t.length<160?list.t:'{}').roles||[]);
    const all=await (await fetch(`/api/v1/workspaces/${WS}/roles`,{credentials:'include'})).json();
    const targets=(all.roles||[]).filter(r=>/QA D Probe/.test(r.name));
    const res=[];
    for (const t of targets) {
      const rev=await j(`/api/v1/workspaces/${WS}/roles/revoke`,'POST',{role_id:t.id,user_id:ALICE});
      const del=await j(`/api/v1/companies/roles/${t.id}`,'DELETE');
      res.push({name:t.name,revoke:rev.s,del:del.s});
    }
    const after=await (await fetch(`/api/v1/workspaces/${WS}/roles`,{credentials:'include'})).json();
    return { cleaned:res, rolesLeft:(after.roles||[]).map(r=>r.name) };
  }, {WS,ALICE});
};
