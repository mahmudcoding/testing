/* Infrastructure, not a repro: clear meetings left running by a previous run.
 *
 * Call findings hand over with their meeting still live — that is the state
 * being judged. Reproducing another one afterwards then fails two ways:
 *
 *   the window is still IN the call, and starts with a co-host already
 *   promoted, whom a host cannot moderate — the menu the next snippet needs
 *   comes back empty;
 *
 *   or the window has left but the MEETING is still active server-side, and a
 *   second call will not start — the route stays on /calls and the snippet
 *   reports it never reached /call/<id>.
 *
 * The second is the one a window-only check misses, so this ends every active
 * meeting in the workspace over the API. No-op when there are none.
 */
export default async ({ page }) => {
  const url = page.url();
  if (!/\/w\//.test(url)) {
    await page.goto('https://airion-cargo.store/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
  }
  const ws = (page.url().match(/\/w\/([^/]+)/) || [])[1];
  if (!ws) return { ok: false, why: 'not signed in to a workspace' };

  const ended = await page.evaluate(async (w) => {
    const r = await fetch(`/api/v1/workspace/${w}/meetings/active`, { credentials: 'include' });
    const j = await r.json().catch(() => ({}));
    const out = [];
    for (const m of (j.meetings || j.data || [])) {
      // cancel answers 409 for a meeting that already started; end is the one
      const res = await fetch(`/api/v1/meeting/${m.id}/end`,
                              { method: 'POST', credentials: 'include' });
      out.push({ id: m.id, status: res.status });
    }
    return out;
  }, ws);

  if (/\/call\//.test(page.url())) {          // walk the window out of the dead call
    await page.goto(`https://airion-cargo.store/w/${ws}/calls`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
  }
  return { ok: true, ended, left: ended.length };
};
