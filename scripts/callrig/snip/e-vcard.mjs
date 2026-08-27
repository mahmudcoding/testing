const WS = 'W4QEF1XTURESO01';
export default async ({ page }) => {
  const caught = [];
  page.on('response', async (res) => {
    const u = res.url();
    if (!/\/api\/v1\/(calendar|workspaces)/.test(u)) return;
    let body = null;
    try { const t = await res.text(); body = t.slice(0, 1400); } catch {}
    caught.push({ u: u.replace(/https:\/\/[^/]+/, '').slice(0, 110), s: res.status(), body });
  });
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4500);
  const chips = await page.$$('button[data-testid="calendar-event-chip"]');
  const results = [];
  for (let i = 0; i < Math.min(chips.length, 4); i++) {
    const c = chips[i];
    const label = await c.evaluate(el => (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 60));
    await c.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await c.click();
    await page.waitForTimeout(2600);
    const ui = await page.evaluate(() => {
      const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      const pick = (tid) => { const e = document.querySelector(`[data-testid="${tid}"]`); return e ? (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 120) : null; };
      const rows = [...document.querySelectorAll('[data-testid="event-attendee-row"]')].filter(vis)
        .map(r => (r.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 90));
      const d = document.querySelector('[role="dialog"]');
      return {
        hidden: pick('event-attendees-hidden'),
        empty: pick('event-attendees-empty'),
        listPresent: !!document.querySelector('[data-testid="event-participants-list"]'),
        rows,
        panel: d ? (d.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 320) : null,
      };
    });
    results.push({ chip: label, ui });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(900);
  }
  return { chipCount: chips.length, results, calls: caught.map(c => `${c.s} ${c.u}`).slice(-14) };
};
