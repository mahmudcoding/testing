export default async ({ page }) => {
  const hit = await page.evaluate(() => {
    const b = document.querySelector('[data-testid="incoming-call-banner-decline"]');
    if (!b) return false; b.click(); return true; });
  await page.waitForTimeout(2500);
  return { clicked: hit };
};
