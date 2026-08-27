export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const keys = await page.evaluate(() => { const o=[];
    for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); const v=localStorage.getItem(k)||'';
      o.push({ key:k, bytes:v.length, userIds:[...new Set((k+v).match(/U4Q[A-Z0-9]{12}/g)||[])],
               sample: v.slice(0,110) }); }
    return o; });
  const authed = await page.evaluate(async () => { const r = await fetch('/api/v1/auth/me',{credentials:'include'}); return r.status; });
  return { authMeStatus: authed, keyCount: keys.length, keys };
};
