export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=company', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2200);
  return await page.evaluate(async () => {
    const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01', ALICE='U4QDALICE000001';
    const jget = async u => { const r=await fetch(u,{credentials:'include'}); const t=await r.text();
      let j=null; try{j=JSON.parse(t);}catch{} return j; };
    const roles = async u => { const j = await jget(u); return Array.isArray(j)?j:(j&&(j.roles||j.items))||[]; };
    const del = async u => { const r=await fetch(u,{method:'DELETE',credentials:'include'});
      const t=await r.text(); return { s:r.status, k:(t.match(/"key":"([^"]+)"/)||[])[1]||'' }; };
    const results=[];
    for (const r of await roles(`/api/v1/companies/${CO}/roles`))
      if (/^D2 reverify/.test(r.name)) results.push({ name:r.name, ...(await del(`/api/v1/companies/roles/${r.id}`)) });
    for (const r of await roles(`/api/v1/workspaces/${W}/roles`))
      if (/^D2 reverify/.test(r.name)) results.push({ name:r.name, ...(await del(`/api/v1/workspaces/roles/${r.id}`)) });
    // correct member reads: the array lives under .members
    const memRoles = async u => { const j = await jget(u); const a = (j && (j.members||j.items)) || [];
      const m = a.find(x=>x.user_id===ALICE); return { listSize:a.length, roles: m ? (m.roles||[]).map(r=>r.name) : '(ALICE ABSENT)' }; };
    const after = { company: await memRoles(`/api/v1/companies/${CO}/members?limit=100&offset=0`),
                    workspace: await memRoles(`/api/v1/workspaces/${W}/members?limit=50`) };
    const left = [];
    for (const [s,u] of [['company',`/api/v1/companies/${CO}/roles`],['workspace',`/api/v1/workspaces/${W}/roles`]])
      for (const r of await roles(u)) left.push(s+':'+r.name);
    return { deletions: results, aliceAfter: after, rolesRemaining: left };
  });
};
