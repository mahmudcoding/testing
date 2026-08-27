/* Lane D helper: put the driven browser's account back on English. */
const WS = 'W4QDF1XTURESO01';
export default async ({ page }) => {
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2800);
  const before = await page.evaluate(() => document.documentElement.lang);
  if (before === 'en') return { before, after: 'en', changed: false };
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('main button[aria-haspopup="dialog"]')][0];
    b && (b.scrollIntoView({ block: 'center' }), b.click());
  });
  await page.waitForTimeout(1400);
  const r = await page.evaluate(() => {
    const d = [...document.querySelectorAll('[role="dialog"]')];
    const el = d[d.length - 1];
    if (!el) return { ok: false };
    const leaves = [...el.querySelectorAll('*')].filter(e => e.children.length === 0 && e.innerText && e.innerText.trim());
    if (leaves.length !== 4) return { ok: false, labels: leaves.map(e => e.innerText.trim()) };
    const t = leaves[0];
    (t.closest('[role="option"],[role="menuitem"],[role="menuitemradio"],button,li') || t).click();
    return { ok: true, clicked: t.innerText.trim() };
  });
  await page.waitForTimeout(2600);
  return { before, after: await page.evaluate(() => document.documentElement.lang), pick: r };
};
