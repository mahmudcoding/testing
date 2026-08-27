export default async ({ page }) => {
  const WANT = process.env.D2_WANT === 'on';
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/profile', { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  return await page.evaluate(async (want) => {
    const me = await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const u = me.user||me; const st = u.settings||{};
    const r = await fetch('/api/v1/auth/me/settings', { method:'PUT', credentials:'include',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ language: st.language||'en', privacy: st.privacy,
                             profile: { ...(st.profile||{}), showTimezone: want }, contacts: st.contacts }) });
    const after = await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const ua = after.user||after;
    return { put:r.status, showTimezone: ((ua.settings||{}).profile||{}).showTimezone, ownTimezone: ua.timezone };
  }, WANT);
};
