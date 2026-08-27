export default async ({ page }) => {
  return await page.evaluate(async () => {
    const j = async u => { const r = await fetch(u,{credentials:'include'}); return {s:r.status, t:(await r.text()).slice(0,1400)}; };
    const out = {};
    for (const u of ['/api/v1/users/me/permissions','/api/v1/auth/me/permissions','/api/v1/users/me/roles']) out[u]=await j(u);
    return out;
  });
};
