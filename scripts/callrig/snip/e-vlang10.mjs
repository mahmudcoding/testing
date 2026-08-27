const WS = 'W4QEF1XTURESO01';
export default async ({ page }) => {
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.locator('button[aria-label="Язык"], button[aria-label="Language"]').first().click();
  await page.waitForTimeout(1500);
  const opt = page.locator('button').filter({ hasText: /^Английский$|^English$/ }).first();
  const n = await opt.count();
  if (n) { await opt.click(); await page.waitForTimeout(3000); }
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4500);
  return await page.evaluate(() => {
    const b = document.querySelector('button[aria-label^="Notifications"], button[aria-label^="Уведомл"]');
    const lb = document.querySelector('button[aria-label="Language"], button[aria-label="Язык"]');
    return { matched: true, bell: b ? b.getAttribute('aria-label') : null, lang: lb ? (lb.innerText || '').trim() : null };
  });
};
