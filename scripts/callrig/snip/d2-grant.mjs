// Parameterised grant/cleanup for the High re-verification.
// D2_SCOPE=company|workspace  D2_ACTION=<action>  D2_MODE=grant|clean
export default async ({ page }) => {
  const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01', ALICE='U4QDALICE000001';
  const SCOPE=process.env.D2_SCOPE, ACTION=process.env.D2_ACTION, MODE=process.env.D2_MODE||'grant';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/roles?scope=company`, { waitUntil:'networkidle' });
  await page.waitForTimeout(1600);
  return await page.evaluate(async ([W,CO,ALICE,SCOPE,ACTION,MODE]) => {
    const call=async(m,u,b)=>{const r=await fetch(u,{method:m,credentials:'include',
      headers:b?{'Content-Type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      const t=await r.text(); let j=null; try{j=JSON.parse(t)}catch{}; return {s:r.status,j,t:t.slice(0,120)};};
    const roles=async u=>{const r=await call('GET',u); const j=r.j;
      return Array.isArray(j)?j:((j&&(j.roles||j.items))||[]);};
    const out={};
    // always clean up any leftover probe roles first
    for (const [sc,u] of [['company',`/api/v1/companies/${CO}/roles`],['workspace',`/api/v1/workspaces/${W}/roles`]]) {
      for (const r of await roles(u)) if (/^D2H /.test(r.name)) {
        await call('POST', sc==='company'?'/api/v1/companies/roles/revoke':`/api/v1/workspaces/${W}/roles/revoke`,
                   {role_id:r.id,user_id:ALICE});
        await call('DELETE', `/api/v1/companies/roles/${r.id}`);
        out.cleaned=(out.cleaned||0)+1;
      }
    }
    if (MODE==='clean') {
      const left=[]; for (const [sc,u] of [['company',`/api/v1/companies/${CO}/roles`],['workspace',`/api/v1/workspaces/${W}/roles`]])
        for (const r of await roles(u)) left.push(sc+':'+r.name);
      out.rolesRemaining=left; return out;
    }
    const perm = SCOPE==='company' ? `company.${CO}.${ACTION}` : `workspace.${W}.${ACTION}`;
    const base = SCOPE==='company' ? `/api/v1/companies/${CO}/roles` : `/api/v1/workspaces/${W}/roles`;
    const c = await call('POST', base, { name:`D2H ${ACTION}`, permissions:[perm] });
    out.create=c.s; const rid=c.j&&(c.j.id||(c.j.role||{}).id); out.roleId=rid;
    if (rid) out.assign=(await call('POST',
      SCOPE==='company'?'/api/v1/companies/roles/assign':`/api/v1/workspaces/${W}/roles/assign`,
      {role_id:rid,user_id:ALICE})).s;
    out.permission=perm.replace(CO,'<CO>').replace(W,'<WS>');
    return out;
  }, [W,CO,ALICE,SCOPE,ACTION,MODE]);
};
