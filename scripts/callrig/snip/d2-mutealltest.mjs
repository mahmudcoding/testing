export default async ({ page }) => {
  const MODE = process.env.D2_MODE || 'on';
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/notifications', { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  return await page.evaluate(async (mode) => {
    const want = mode === 'on';
    const r = await fetch('/api/v1/notifications/settings', { method:'PATCH', credentials:'include',
      headers:{'Content-Type':'application/json'}, body: JSON.stringify({ mute_all_channels: want }) });
    const body = await r.text();
    // baseline notification count
    const n = await (await fetch('/api/v1/notifications?limit=30',{credentials:'include'})).json();
    const arr = n.notifications||n.items||[];
    return { patch:r.status, settings: body.slice(0,140), notificationCount: arr.length,
             newest: arr.slice(0,2).map(x=>({ type:x.type, title:x.title, at:x.created_at })) };
  }, MODE);
};
