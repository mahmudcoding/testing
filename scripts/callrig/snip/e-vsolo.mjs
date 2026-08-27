const WS = 'W4QEF1XTURESO01', SOLO = 'S4OWDQTIARFH4P5';
export default async ({ page }) => {
  if (!page.url().includes('airion-cargo')) await page.goto('https://airion-cargo.store/', { waitUntil: 'domcontentloaded' });
  const api = await page.evaluate(async (SOLO) => {
    const r = await fetch(`/api/v1/calendar/meetings/${SOLO}`, { credentials: 'include' });
    const j = await r.json().catch(() => null);
    return {
      status: r.status, topKeys: j ? Object.keys(j) : null,
      attendeesPresent: j ? ('attendees' in j) : null,
      attendeesValue: j?.attendees === null ? 'null' : Array.isArray(j?.attendees) ? `array(${j.attendees.length})` : j?.attendees === undefined ? 'ABSENT' : typeof j?.attendees,
    };
  }, SOLO);
  // now the UI
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4200);
  const chips = await page.$$('button[data-testid="calendar-event-chip"]');
  let ui = null;
  for (const c of chips) {
    const label = await c.evaluate(el => (el.innerText || '').replace(/\s+/g, ' ').trim());
    if (!/Solo Check/.test(label)) continue;
    await c.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await c.click();
    await page.waitForTimeout(2600);
    ui = await page.evaluate(() => {
      const pick = (tid) => { const e = document.querySelector(`[data-testid="${tid}"]`); return e ? (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 120) : null; };
      const d = document.querySelector('[role="dialog"]');
      return {
        hidden: pick('event-attendees-hidden'),
        empty: pick('event-attendees-empty'),
        listPresent: !!document.querySelector('[data-testid="event-participants-list"]'),
        panel: d ? (d.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 260) : null,
      };
    });
    break;
  }
  return { api, ui, chipsSeen: chips.length };
};
