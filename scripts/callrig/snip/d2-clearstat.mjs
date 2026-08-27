export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/profile', { waitUntil:'networkidle' });
  await page.waitForTimeout(2200);
  return await page.evaluate(async () => {
    const d = await fetch('/api/v1/users/me/status', { method:'DELETE', credentials:'include' });
    const j = await (await fetch('/api/v1/auth/me',{credentials:'include'})).json(); const u=j.user||j;
    return { del:d.status, statusNow: u.custom_status ?? '(cleared)' };
  });
};
