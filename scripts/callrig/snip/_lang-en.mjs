/* Infrastructure, not a repro: put the driving account's interface back to
 * English before a run.
 *
 * A finding about a non-English locale has to LEAVE the app in that locale —
 * that is the state being judged — so it cannot restore anything itself. Every
 * other snippet matches English strings, so once such a finding has been run,
 * every finding judged afterwards on that account fails on a screen it cannot
 * read. Resetting here costs a few seconds and removes the whole class.
 *
 * The picker's own labels are localized, so options go by position:
 * 0 English, 1 Russian, 2 Uzbek, 3 Uzbek (Cyrillic).
 */
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  const ws = (page.url().match(/\/w\/([^/]+)/) || [])[1];
  if (!ws) return { ok: false, why: 'not signed in to a workspace' };

  await page.goto(`https://airion-cargo.store/w/${ws}/settings/account`,
                  { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2200);
  const before = await page.evaluate(() => document.documentElement.lang);
  if (before === 'en') return { ok: true, before, after: 'en', changed: false };

  await page.evaluate(() => {
    const b = [...document.querySelectorAll('main button[aria-haspopup="dialog"]')][0];
    b && (b.scrollIntoView({ block: 'center' }), b.click());
  });
  await page.waitForTimeout(1400);
  await page.evaluate(() => {
    const dlgs = [...document.querySelectorAll('[role="dialog"]')];
    const el = dlgs[dlgs.length - 1];
    if (!el) return;
    const leaves = [...el.querySelectorAll('*')]
      .filter(e => e.children.length === 0 && e.innerText && e.innerText.trim());
    if (leaves.length !== 4) return;
    const t = leaves[0];
    (t.closest('[role="option"],[role="menuitem"],[role="menuitemradio"],button,li') || t).click();
  });
  await page.waitForTimeout(2600);
  const after = await page.evaluate(() => document.documentElement.lang);
  return { ok: after === 'en', before, after, changed: before !== after };
};
