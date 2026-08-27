export default async ({ page }) => {
  const MODE = process.env.D2_MODE || 'CLEANUP';
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=company', { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(1400);
  return await page.evaluate(`(async () => {
    const CO='O4QDF1XTURESO01', W='W4QDF1XTURESO01', ALICE='U4QDALICE000001', OUT='U4QDOUTSIDER001';
    const call=async(m,u,b)=>{const r=await fetch(u,{method:m,credentials:'include',
      headers:b?{'Content-Type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      const t=await r.text(); let j=null; try{j=JSON.parse(t);}catch{}; return {s:r.status,b:t.slice(0,200),j};};
    const norm=x=>Array.isArray(x.j)?x.j:((x.j&&x.j.roles)||[]);
    // clean first
    const out={cleaned:[]};
    for (const [sc,u] of [['co',\`/api/v1/companies/\${CO}/roles\`],['ws',\`/api/v1/workspaces/\${W}/roles\`]]) {
      const l=await call('GET',u);
      for (const r of norm(l)) if (/^D2X /.test(r.name)) {
        await call('POST', sc==='co'?'/api/v1/companies/roles/revoke':\`/api/v1/workspaces/\${W}/roles/revoke\`, {role_id:r.id,user_id:ALICE});
        await call('POST', sc==='co'?'/api/v1/companies/roles/revoke':\`/api/v1/workspaces/\${W}/roles/revoke\`, {role_id:r.id,user_id:OUT});
        const d=await call('DELETE', \`/api/v1/companies/roles/\${r.id}\`); out.cleaned.push(sc+':'+r.name+':'+d.s);
      }
    }
    if (${JSON.stringify(process.env.D2_MODE||'CLEANUP')} === 'CLEANUP') return out;
    // 1. wildcard company role
    const w=await call('POST', \`/api/v1/companies/\${CO}/roles\`, {name:'D2X wildcard', permissions:[\`company.\${CO}.*\`]});
    out.wildcardCreate={s:w.s, b:w.b.slice(0,120)};
    if (w.j&&w.j.id) out.wildcardAssign=(await call('POST','/api/v1/companies/roles/assign',{role_id:w.j.id,user_id:ALICE})).s;
    // 2. workspace role assigned to a company member who is NOT in the workspace
    const ws=await call('POST', \`/api/v1/workspaces/\${W}/roles\`, {name:'D2X wsrole', permissions:[\`workspace.\${W}.audit.view\`]});
    out.wsRoleCreate={s:ws.s};
    if (ws.j&&ws.j.id) {
      const a=await call('POST', \`/api/v1/workspaces/\${W}/roles/assign\`, {role_id:ws.j.id, user_id:OUT});
      out.assignWorkspaceRoleToNonMember={s:a.s, b:a.b.slice(0,180)};
    }
    return out;
  })()`);
};
