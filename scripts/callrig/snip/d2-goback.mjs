export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/account', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2500);
  return { url: page.url().replace('https://airion-cargo.store','') };
};
