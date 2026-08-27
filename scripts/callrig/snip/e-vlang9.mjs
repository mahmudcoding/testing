const WS = 'W4QEF1XTURESO01';
export default async ({ page }) => {
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  const trig = page.locator('button[aria-label="Язык"], button[aria-label="Language"]').first();
  await trig.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1200);
  const seen = [];
  for (let i = 0; i < 6; i++) {
    const cur = await page.evaluate(() => {
      const a = document.activeElement;
      return { txt: (a?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 24), role: a?.getAttribute('role'), tag: a?.tagName };
    });
    seen.push(cur);
    if (/English/i.test(cur.txt)) { await page.keyboard.press('Enter'); break; }
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(350);
  }
  await page.waitForTimeout(2500);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  const after = await page.evaluate(() => {
    const b = document.querySelector('button[aria-label^="Notifications"], button[aria-label^="Уведомл"]');
    const lb = document.querySelector('button[aria-label="Language"], button[aria-label="Язык"]');
    return { bell: b ? b.getAttribute('aria-label') : null, lang: lb ? (lb.innerText || '').trim() : null };
  });
  return { seen, after };
};
