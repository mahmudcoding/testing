const WS = 'W4QEF1XTURESO01';
export default async ({ page }) => {
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.locator('button[aria-label="Language"], button[aria-label="Язык"]').first().click();
  await page.waitForTimeout(1500);
  const opts = await page.evaluate(() => {
    const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    return [...document.querySelectorAll('[role=option],[role=menuitem]')].filter(vis)
      .map((b, i) => ({ i, txt: (b.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 30) }));
  });
  const idx = opts.findIndex(o => /English/i.test(o.txt));
  if (idx >= 0) {
    const els = await page.$$('[role=option],[role=menuitem]');
    await els[idx].click();
    await page.waitForTimeout(2500);
  }
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  const after = await page.evaluate(() => {
    const b = document.querySelector('button[aria-label^="Notifications"], button[aria-label^="Уведомл"]');
    const lb = document.querySelector('button[aria-label="Language"], button[aria-label="Язык"]');
    return { bell: b ? b.getAttribute('aria-label') : null, lang: lb ? (lb.innerText || '').trim() : null };
  });
  return { opts, picked: idx, after };
};
