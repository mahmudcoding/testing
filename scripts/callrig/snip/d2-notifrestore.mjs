export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/notifications', { waitUntil:'networkidle' });
  await page.waitForTimeout(2500);
  return await page.evaluate(async () => {
    const r = await fetch('/api/v1/notifications/settings', { method:'PATCH', credentials:'include',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ in_app_enabled:true, mute_all_channels:false }) });
    const body = await r.text();
    const now = await (await fetch('/api/v1/notifications/settings',{credentials:'include'})).text();
    return { patch:r.status, body:body.slice(0,120), settingsNow: now.slice(0,180) };
  });
};
