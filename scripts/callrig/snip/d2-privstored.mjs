export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/privacy', { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  return await page.evaluate(`(async()=>{
    const a=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return { email:a.email, settingsKeys:Object.keys(a.settings||{}),
             privacy: (a.settings||{}).privacy ?? '(absent)' };})()`);
};
