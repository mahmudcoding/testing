export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/appearance', { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  const before = await page.evaluate(() => localStorage.getItem('aloqa.appearance')||'(absent)');
  await page.evaluate(() => localStorage.removeItem('aloqa.appearance'));
  await page.reload({ waitUntil:'networkidle' }); await page.waitForTimeout(2000);
  return { removed: before.slice(0,120), now: await page.evaluate(() => localStorage.getItem('aloqa.appearance')||'(absent — defaults)') };
};
