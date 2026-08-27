export default async ({ page }) => {
  return await page.evaluate(async () => {
    const j = async u => { const r = await fetch(u, {credentials:'include'}); return {s:r.status, b: await r.text()}; };
    const me = await j('/api/v1/auth/me');
    const out = { meStatus: me.s, meShape: me.b.slice(0, 420) };
    let co = null;
    try { const p = JSON.parse(me.b); co = p?.data?.company?.id || p?.data?.company_id || p?.company?.id || p?.data?.user?.company_id; } catch {}
    out.co = co;
    if (co) {
      for (const u of [`/api/v1/companies/${co}/permissions`, `/api/v1/companies/${co}/roles`]) {
        const r = await j(u); out[u] = r.s + ' :: ' + r.b.slice(0, 300);
      }
    }
    return out;
  });
};
