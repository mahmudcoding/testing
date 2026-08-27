/* Infrastructure: one pass that puts a browser back to a neutral state.
 * Merges the language reset and the meeting sweep — two separate snippets meant
 * two node spawns and two CDP connections per browser, and with four browsers a
 * finding that is the dominant cost of a run.
 * Both halves no-op fast when there is nothing to undo.
 */
export default async ({ page }) => {
  if (!/\/w\//.test(page.url())) {
    await page.goto('https://airion-cargo.store/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(900);
  }
  const ws = (page.url().match(/\/w\/([^/]+)/) || [])[1];
  if (!ws) return { ok: false, why: 'not signed in to a workspace' };

  // 1. end any meeting still running, so a second call can start
  const ended = await page.evaluate(async (w) => {
    const r = await fetch(`/api/v1/workspace/${w}/meetings/active`, { credentials: 'include' });
    const j = await r.json().catch(() => ({}));
    const out = [];
    for (const m of (j.meetings || j.data || [])) {
      const res = await fetch(`/api/v1/meeting/${m.id}/end`, { method: 'POST', credentials: 'include' });
      out.push(res.status);
    }
    return out;
  }, ws);

  // 2. walk out of a dead call, and land where the language picker lives
  await page.goto(`https://airion-cargo.store/w/${ws}/settings/account`,
                  { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1600);

  // 3. English, chosen by position because the picker's own labels are localized
  const before = await page.evaluate(() => document.documentElement.lang);
  if (before !== 'en') {
    await page.evaluate(() => {
      const b = [...document.querySelectorAll('main button[aria-haspopup="dialog"]')][0];
      b && (b.scrollIntoView({ block: 'center' }), b.click());
    });
    await page.waitForTimeout(1200);
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
    await page.waitForTimeout(2200);
  }
  const after = await page.evaluate(() => document.documentElement.lang);
  return { ok: true, endedMeetings: ended.length, lang: { before, after } };
};
