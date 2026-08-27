export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/notifications', { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  return await page.evaluate(async () => {
    const s = await (await fetch('/api/v1/notifications/settings',{credentials:'include'})).text();
    const n = await (await fetch('/api/v1/notifications?limit=30',{credentials:'include'})).json();
    const arr = n.notifications||n.items||[];
    return { settings: s.slice(0,140), count: arr.length,
             newest: arr.slice(0,3).map(x=>({ type:x.type, title:x.title, body:(x.body||'').slice(0,50), at:x.created_at })) };
  });
};
