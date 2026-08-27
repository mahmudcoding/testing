export default async ({ page }) => {
  const WANT = process.env.D2_WANT || 'nobody';
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/privacy', { waitUntil:'networkidle' });
  await page.waitForTimeout(2500);
  return await page.evaluate(async (want) => {
    const cur = await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const u = cur.user||cur; const priv = (u.settings||{}).privacy || {};
    const next = { ...priv, profile_visibility: want };
    const r = await fetch('/api/v1/auth/me/settings', { method:'PUT', credentials:'include',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ language:(u.settings||{}).language||'en', privacy: next,
                             profile:(u.settings||{}).profile, contacts:(u.settings||{}).contacts }) });
    const after = await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const ua = after.user||after;
    return { put:r.status, privacyNow:(ua.settings||{}).privacy };
  }, WANT);
};
