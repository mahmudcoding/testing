const WS = 'W4QEF1XTURESO01';
export default async ({ page }) => {
  const net = [];
  page.on('response', async r => {
    if (/\/api\/v1\/(users|settings|auth)/.test(r.url()) && r.request().method() !== 'GET')
      net.push(`${r.request().method()} ${r.url().replace(/https:\/\/[^/]+/, '')} ${r.status()} ${(r.request().postData() || '').slice(0, 90)}`);
  });
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.locator('button[aria-label="Язык"], button[aria-label="Language"]').first().click();
  await page.waitForTimeout(1500);
  const en = page.locator('[role=option],[role=menuitem],button').filter({ hasText: /English/i }).first();
  const n = await en.count();
  if (n) await en.click();
  await page.waitForTimeout(3000);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  const after = await page.evaluate(() => {
    const b = document.querySelector('button[aria-label^="Notifications"], button[aria-label^="Уведомл"]');
    const lb = document.querySelector('button[aria-label="Language"], button[aria-label="Язык"]');
    return { bell: b ? b.getAttribute('aria-label') : null, lang: lb ? (lb.innerText || '').trim() : null };
  });
  return { matched: n, net, after };
};
