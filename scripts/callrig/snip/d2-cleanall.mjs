export default async ({ page }) => {
  const CO='O4QDF1XTURESO01', WS='W4QDF1XTURESO01', ALICE='U4QDALICE000001';
  return await page.evaluate(async ({CO,WS,ALICE}) => {
    const j=async(u,m,b)=>{const r=await fetch(u,{method:m||'GET',credentials:'include',
      headers:b?{'content-type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      return {s:r.status,t:(await r.text()).slice(0,100)};};
    const out={removed:[]};
    for (const [scope,url] of [['company',`/api/v1/companies/${CO}/roles`],['workspace',`/api/v1/workspaces/${WS}/roles`]]) {
      const all=await (await fetch(url,{credentials:'include'})).json();
      for (const r of (all.roles||[])) {
        if (!/QA D (CoProbe|ReproProbe|Probe)/.test(r.name)) continue;
        if (scope==='company') await j('/api/v1/companies/roles/revoke','POST',{role_id:r.id,user_id:ALICE});
        else await j(`/api/v1/workspaces/${WS}/roles/revoke`,'POST',{role_id:r.id,user_id:ALICE});
        const d=await j(`/api/v1/companies/roles/${r.id}`,'DELETE');
        out.removed.push({name:r.name, scope, del:d.s});
      }
    }
    const co=await (await fetch(`/api/v1/companies/${CO}/roles`,{credentials:'include'})).json();
    const ws=await (await fetch(`/api/v1/workspaces/${WS}/roles`,{credentials:'include'})).json();
    out.companyRoles=(co.roles||[]).map(r=>r.name);
    out.workspaceRoles=(ws.roles||[]).map(r=>r.name);
    return out;
  }, {CO,WS,ALICE});
};
