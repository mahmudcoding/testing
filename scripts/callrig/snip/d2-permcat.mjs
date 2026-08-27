export default async ({ page }) => {
  return await page.evaluate(async () => {
    const j = async u => { const r = await fetch(u, {credentials:'include'}); return {s:r.status, b: await r.json().catch(()=>null)}; };
    const me = await j('/api/v1/auth/me');
    const co = me.b?.data?.company_id || me.b?.company_id;
    const out = { co };
    for (const u of ['/api/v1/permissions', '/api/v1/companies/permissions', `/api/v1/companies/${co}/permissions`]) {
      const r = await j(u);
      out[u] = r.s;
      if (r.s === 200) {
        const arr = r.b?.data || r.b?.permissions || r.b;
        if (Array.isArray(arr)) out.list = arr.map(x => typeof x === 'string' ? x : (x.action || x.key || x.name || JSON.stringify(x).slice(0,60)));
      }
    }
    return out;
  });
};
