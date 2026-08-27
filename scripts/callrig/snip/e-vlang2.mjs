const WS = 'W4QEF1XTURESO01';
export default async ({ page }) => {
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.locator('button[aria-label="Language"]').first().click();
  await page.waitForTimeout(1200);
  const opts = await page.evaluate(() => {
    const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    return [...document.querySelectorAll('[role=option],[role=menuitem],li button,button')].filter(vis)
      .map(b => (b.innerText || '').replace(/\s+/g, ' ').trim()).filter(t => /рус|engl|uzb|o'z/i.test(t)).slice(0, 8);
  });
  // pick Russian
  const ru = page.locator('[role=option],[role=menuitem],button').filter({ hasText: /Рус|Russian/i }).first();
  const found = await ru.count();
  if (found) { await ru.click(); await page.waitForTimeout(2500); }
  await page.goto(`https://airion-cargo.store/w/${WS}/c/C4QEGENERAL0001`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4500);
  const bell = await page.$('button[aria-label^="Notifications"], button[aria-label^="Уведомл"]');
  if (bell) { await bell.click(); await page.waitForTimeout(2500); }
  const panel = await page.evaluate(() => {
    const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const p = [...document.querySelectorAll('[role="dialog"],aside')].filter(vis).sort((a, b) => b.innerText.length - a.innerText.length)[0];
    return p ? (p.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 380) : null;
  });
  return { optionsSeen: opts, clickedRussian: !!found, panel };
};
