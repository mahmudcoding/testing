export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/about', { waitUntil:'networkidle' });
  await page.waitForTimeout(2200);
  return await page.evaluate(() => ({
    diagnostics: localStorage.getItem('aloqa.diagnostics.consent'),
  }));
};
