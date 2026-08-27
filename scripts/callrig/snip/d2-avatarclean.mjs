export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/account', { waitUntil:'networkidle' });
  await page.waitForTimeout(2500);
  const r = await page.evaluate(async () => {
    const d = await fetch('/api/v1/users/me/avatar', { method:'DELETE', credentials:'include' });
    const j = await (await fetch('/api/v1/auth/me',{credentials:'include'})).json(); const u=j.user||j;
    return { deleteStatus:d.status, avatarField: u.avatar_url ?? '(absent — back to initials)' };
  });
  await page.reload({ waitUntil:'networkidle' }); await page.waitForTimeout(2000);
  return r;
};
