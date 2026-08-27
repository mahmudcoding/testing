export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=company', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  return await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01', W='W4QDF1XTURESO01', ALICE='U4QDALICE000001';
    const jget = async u => { const r=await fetch(u,{credentials:'include'}); const t=await r.text();
      try { return JSON.parse(t); } catch { return null; } };
    const roles = async u => { const j=await jget(u); return Array.isArray(j)?j:(j&&(j.roles||j.items))||[]; };
    const out={ deleted:[] };
    for (const r of await roles(`/api/v1/companies/${CO}/roles`)) {
      if (!/^D2 /.test(r.name)) continue;
      await fetch('/api/v1/companies/roles/revoke',{method:'POST',credentials:'include',
        headers:{'Content-Type':'application/json'},body:JSON.stringify({role_id:r.id,user_id:ALICE})});
      const d=await fetch(`/api/v1/companies/roles/${r.id}`,{method:'DELETE',credentials:'include'});
      out.deleted.push(r.name+' -> '+d.status);
    }
    for (const r of await roles(`/api/v1/workspaces/${W}/roles`)) if (/^D2 /.test(r.name)) {
      const d=await fetch(`/api/v1/companies/roles/${r.id}`,{method:'DELETE',credentials:'include'});
      out.deleted.push('(ws) '+r.name+' -> '+d.status); }
    const mem = async u => { const j=await jget(u); const a=(j&&(j.members||j.items))||[];
      const m=a.find(x=>x.user_id===ALICE); return { listSize:a.length, roles:m?(m.roles||[]).map(r=>r.name):'(ABSENT)' }; };
    out.aliceCompany = await mem(`/api/v1/companies/${CO}/members?limit=100&offset=0`);
    out.aliceWorkspace = await mem(`/api/v1/workspaces/${W}/members?limit=50`);
    out.rolesRemaining = [];
    for (const [s,u] of [['company',`/api/v1/companies/${CO}/roles`],['workspace',`/api/v1/workspaces/${W}/roles`]])
      for (const r of await roles(u)) out.rolesRemaining.push(s+':'+r.name);
    return out;
  });
};
