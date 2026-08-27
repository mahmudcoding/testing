export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/profile', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  return await page.evaluate(async () => {
    const r = await fetch('/api/v1/auth/me', { credentials: 'include' });
    const t = await r.text();
    const j = JSON.parse(t);
    const u = j.user || j;
    const walk = (o, p = '') => { let out = []; for (const k of Object.keys(o || {})) {
      const v = o[k]; const key = p ? p + '.' + k : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) out = out.concat(walk(v, key));
      else out.push(key + ' = ' + JSON.stringify(v).slice(0, 46)); } return out; };
    return { authMeKeys: walk(u), rawLen: t.length };
  });
};
