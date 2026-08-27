const WS = 'W4QEF1XTURESO01';
export default async ({ page }) => {
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  const btn = page.locator('button[aria-label="Language"], button[aria-label="Язык"]').first();
  await btn.click();
  await page.waitForTimeout(1200);
  const en = page.locator('[role=option],[role=menuitem],button').filter({ hasText: /^English$/i }).first();
  const n = await en.count();
  if (n) { await en.click(); await page.waitForTimeout(2500); }
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  return await page.evaluate(() => {
    const b = document.querySelector('button[aria-label^="Notifications"], button[aria-label^="Уведомл"]');
    const lb = document.querySelector('button[aria-label="Language"], button[aria-label="Язык"]');
    return { bell: b ? b.getAttribute('aria-label') : null, lang: lb ? (lb.innerText || '').trim() : null };
  });
};
