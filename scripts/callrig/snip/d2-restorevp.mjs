export default async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1062 });
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/account', { waitUntil:'networkidle' });
  await page.waitForTimeout(1500);
  return await page.evaluate(() => ({ viewport: window.innerWidth+'x'+window.innerHeight }));
};
