export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/notifications', { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(1400);
  return await page.evaluate(async () => {
    const r=await fetch('/api/v1/notifications/settings',{method:'PATCH',credentials:'include',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({in_app_enabled:true, mute_all_channels:false, mute_unknown_dm_users:false})});
    return { s:r.status, b:(await r.text()).slice(0,140) };
  });
};
