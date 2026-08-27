export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/account', { waitUntil:'networkidle' });
  await page.waitForTimeout(2500);
  const out = {};
  // 1. server-side: clear the profile/contact test values, keep language + privacy at defaults
  out.server = await page.evaluate(async () => {
    const me = await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const u = me.user||me; const st = u.settings||{};
    const r = await fetch('/api/v1/auth/me/settings', { method:'PUT', credentials:'include',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        language: 'en',
        privacy: { version:1, read_receipts:true, online_visibility:'workspace',
                   profile_visibility:'workspace', last_seen_visibility:'workspace' },
        profile: { jobTitle:'', department:'', pronouns:'', showTimezone:false, awayWhenInactive:false },
        contacts: { phone:'', linkedin:'', github:'', website:'' } }) });
    const s2 = await fetch('/api/v1/users/me/status', { method:'PUT', credentials:'include',
      headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text:'', expires_at:null }) });
    const after = await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const ua = after.user||after;
    return { settingsPut:r.status, statusPut:s2.status,
             profile:(ua.settings||{}).profile, contacts:(ua.settings||{}).contacts,
             customStatus: ua.custom_status ?? '(cleared)' };
  });
  // 2. browser-local: reset the appearance store this profile accumulated
  out.local = await page.evaluate(() => {
    const before = localStorage.getItem('aloqa.appearance');
    localStorage.removeItem('aloqa.appearance');
    return { removed: before ? before.slice(0,140) : '(was absent)' };
  });
  await page.reload({ waitUntil:'networkidle' }); await page.waitForTimeout(2500);
  out.appearanceAfterReload = await page.evaluate(() => localStorage.getItem('aloqa.appearance')||'(absent — defaults)');
  return out;
};
