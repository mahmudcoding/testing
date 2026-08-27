export default async ({ page }) => {
  const MODE=process.env.D2_MODE||'CLEANUP';
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=company', { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(1400);
  return await page.evaluate(`(async () => {
    const CO='O4QDF1XTURESO01', W='W4QDF1XTURESO01', BOB='U4QDBOB00000001';
    const call=async(m,u,b)=>{const r=await fetch(u,{method:m,credentials:'include',
      headers:b?{'Content-Type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      const t=await r.text(); let j=null; try{j=JSON.parse(t);}catch{}; return {s:r.status,j,b:t.slice(0,120)};};
    const norm=x=>Array.isArray(x.j)?x.j:((x.j&&x.j.roles)||[]);
    const out={cleaned:[]};
    for (const [sc,u] of [['co',\`/api/v1/companies/\${CO}/roles\`],['ws',\`/api/v1/workspaces/\${W}/roles\`]]) {
      for (const r of norm(await call('GET',u))) if (/^D2B /.test(r.name)) {
        await call('POST', sc==='co'?'/api/v1/companies/roles/revoke':\`/api/v1/workspaces/\${W}/roles/revoke\`, {role_id:r.id,user_id:BOB});
        const d=await call('DELETE', \`/api/v1/companies/roles/\${r.id}\`); out.cleaned.push(sc+':'+r.name+':'+d.s);
      }
    }
    if (${JSON.stringify(process.env.D2_MODE||'CLEANUP')}==='CLEANUP') return out;
    const wi=await call('POST', \`/api/v1/workspaces/\${W}/roles\`, {name:'D2B invite', permissions:[\`workspace.\${W}.invite\`]});
    if (wi.j&&wi.j.id) out.inviteAssign=(await call('POST', \`/api/v1/workspaces/\${W}/roles/assign\`, {role_id:wi.j.id,user_id:BOB})).s;
    const rm=await call('POST', \`/api/v1/companies/\${CO}/roles\`, {name:'D2B rolemanage', permissions:[\`company.\${CO}.role.manage\`]});
    if (rm.j&&rm.j.id) out.roleManageAssign=(await call('POST','/api/v1/companies/roles/assign',{role_id:rm.j.id,user_id:BOB})).s;
    return out;
  })()`);
};
