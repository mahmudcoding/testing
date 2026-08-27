export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2200);
  return await page.evaluate(`(async()=>{const a=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return { name:a.name, profile:a.settings.profile, contacts:a.settings.contacts };})()`);
};
