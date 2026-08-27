export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=company', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2200);
  return await page.evaluate(async () => {
    const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01', ALICE='U4QDALICE000001';
    const call = async (m,u) => { const r=await fetch(u,{method:m,credentials:'include'});
      const t=await r.text(); return { s:r.status, k:(t.match(/"key":"([^"]+)"/)||[])[1]||'' }; };
    const get = async u => { const r=await fetch(u,{credentials:'include'}); const j=await r.json();
      return Array.isArray(j)?j:(j.roles||j.items||[]); };
    const probes = [];
    for (const [scope, url] of [['company', `/api/v1/companies/${CO}/roles`], ['workspace', `/api/v1/workspaces/${W}/roles`]])
      for (const r of await get(url)) if (/^D2 reverify/.test(r.name)) probes.push({ scope, id:r.id, name:r.name });
    const results = [];
    for (const p of probes) {
      const paths = p.scope === 'company'
        ? [`/api/v1/companies/${CO}/roles/${p.id}`, `/api/v1/roles/${p.id}`]
        : [`/api/v1/workspaces/${W}/roles/${p.id}`, `/api/v1/roles/${p.id}`];
      let done = null;
      for (const u of paths) { const r = await call('DELETE', u); if (r.s < 300) { done = u.replace(/\/[A-Z0-9]{15}$/,'/{id}'); break; }
        if (!done) done = `FAILED ${r.s} ${r.k}`; }
      results.push({ ...p, outcome: done });
    }
    // confirm alice is back to baseline
    const cm = await get(`/api/v1/companies/${CO}/members?limit=100&offset=0`);
    const ws = await get(`/api/v1/workspaces/${W}/members?limit=50`);
    const findRoles = arr => { const m = (arr||[]).find(x=>x.user_id===ALICE); return m ? (m.roles||[]).map(r=>r.name) : '(not found)'; };
    return { probeRolesFound: probes.length, results,
             aliceCompanyRoles: findRoles(cm), aliceWorkspaceRoles: findRoles(ws) };
  });
};
