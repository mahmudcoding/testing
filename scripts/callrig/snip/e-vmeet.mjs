const WS = 'W4QEF1XTURESO01';
export default async ({ page }) => {
  if (!page.url().includes('airion-cargo')) await page.goto('https://airion-cargo.store/', { waitUntil: 'domcontentloaded' });
  return await page.evaluate(async (WS) => {
    const r = await fetch(`/api/v1/calendar/meetings?workspace_id=${WS}`, { credentials: 'include' });
    const j = await r.json().catch(() => null);
    const arr = Array.isArray(j) ? j : (j?.meetings ?? j?.items ?? j?.data ?? j?.events ?? []);
    return {
      status: r.status,
      topKeys: j && !Array.isArray(j) ? Object.keys(j).slice(0, 10) : 'array',
      n: arr.length,
      meetings: arr.slice(0, 8).map(m => ({
        id: m.id, title: m.title ?? m.name ?? null, start: m.start_time ?? m.starts_at ?? m.start ?? null,
        organizer: m.organizer_id ?? m.created_by ?? null,
        hasParticipants: 'participants' in (m || {}), hasAttendees: 'attendees' in (m || {}),
        pcount: m.participant_count ?? null,
        keys: Object.keys(m || {}).slice(0, 22),
      })),
    };
  }, WS);
};
