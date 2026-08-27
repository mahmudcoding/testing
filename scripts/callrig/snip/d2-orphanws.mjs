export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/chat', { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(1500);
  return await page.evaluate(async () => {
    const WA='W4OWMGU872O1OZJ', CO='O4QDF1XTURESO01';
    const g=async u=>{const r=await fetch(u,{credentials:'include'});return {s:r.status,b:(await r.text()).slice(0,320)};};
    return {
      raw_list: await g('/api/v1/users/me/workspaces'),
      the_ws:   await g(`/api/v1/workspaces/${WA}`),
      companies:await g('/api/v1/users/me/companies'),
      co_ws:    await g(`/api/v1/companies/${CO}/workspaces`),
    };
  });
};
