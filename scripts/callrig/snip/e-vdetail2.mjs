const IDS = ['S4OWB38X0FRCCS3', 'S4OWB577EO9O4DE'];
export default async ({ page }) => {
  if (!page.url().includes('airion-cargo')) await page.goto('https://airion-cargo.store/', { waitUntil: 'domcontentloaded' });
  return await page.evaluate(async (IDS) => {
    const me = await (await fetch('/api/v1/auth/me', { credentials: 'include' })).json().catch(() => null);
    const out = { me: me?.id ?? null, runs: [] };
    for (let pass = 1; pass <= 2; pass++) {
      for (const id of IDS) {
        const r = await fetch(`/api/v1/calendar/meetings/${id}`, { credentials: 'include' });
        const j = await r.json().catch(() => null);
        out.runs.push({
          pass, id, status: r.status,
          topKeys: j ? Object.keys(j) : null,
          attendeesPresent: j ? ('attendees' in j) : null,
          attendees: Array.isArray(j?.attendees)
            ? j.attendees.map(a => ({ uid: String(a.user_id || '').slice(-8), rsvp: a.rsvp_status, req: a.is_required }))
            : (j?.attendees === null ? 'null' : j?.attendees === undefined ? 'ABSENT' : typeof j?.attendees),
        });
      }
    }
    return out;
  }, IDS);
};
