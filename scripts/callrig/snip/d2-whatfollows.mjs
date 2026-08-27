export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/calls', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  return await page.evaluate(async () => {
    const local = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i); const v = localStorage.getItem(k) || '';
      local[k] = v.length > 160 ? v.slice(0, 160) + `…(${v.length}b)` : v;
    }
    const session = {};
    for (let i = 0; i < sessionStorage.length; i++) { const k = sessionStorage.key(i); session[k] = (sessionStorage.getItem(k)||'').slice(0,80); }
    const me = await (await fetch('/api/v1/auth/me', { credentials:'include' })).json();
    const u = me.user || me;
    let notif = null;
    for (const p of ['/api/v1/users/me/notification-settings','/api/v1/notifications/settings','/api/v1/users/me/settings']) {
      try { const r = await fetch(p, { credentials:'include' }); if (r.status === 200) { notif = { path:p, body:(await r.text()).slice(0,320) }; break; }
            if (!notif) notif = { path:p, status:r.status }; } catch {}
    }
    return { localStorageKeys: local, sessionStorageKeys: Object.keys(session),
             serverSettings: u.settings || null, serverTopLevel: Object.keys(u).filter(k=>k!=='settings'),
             notificationSettings: notif };
  });
};
