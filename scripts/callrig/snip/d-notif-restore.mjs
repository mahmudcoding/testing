export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/notifications`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('main [role="switch"], main button[aria-pressed], main button[data-state]').nth(1).click();
  await page.waitForTimeout(1500);
  const save = page.locator('button').filter({hasText:/Save preferences/i}).first();
  if (await save.count()) { await save.click(); await page.waitForTimeout(3500); }
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  return await page.evaluate(async()=> (await (await fetch('/api/v1/notifications/settings',{credentials:'include'})).json()));
};
