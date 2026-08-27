export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/account', { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(1200);
  return await page.evaluate(async () => {
    const W='W4QDF1XTURESO01';
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const g=async u=>{const r=await fetch(u,{credentials:'include'});return {s:r.status,b:(await r.text()).slice(0,240)};};
    return { who: me.email||(me.user&&me.user.email),
             storage: await g(`/api/v1/workspaces/${W}/storage`),
             recq:    await g(`/api/v1/workspaces/${W}/recordings-quota`),
             userScoped: await g('/api/v1/users/me/storage') };
  });
};
