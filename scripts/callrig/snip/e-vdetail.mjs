const IDS = ['S4OWB38X0FRCCS3', 'S4OWB577EO9O4DE'];
export default async ({ page }) => {
  if (!page.url().includes('airion-cargo')) await page.goto('https://airion-cargo.store/', { waitUntil: 'domcontentloaded' });
  return await page.evaluate(async (IDS) => {
    const me = await (await fetch('/api/v1/auth/me', { credentials: 'include' })).json().catch(() => null);
    const out = { me: me?.id ?? null, meetings: [] };
    for (const id of IDS) {
      const r = await fetch(`/api/v1/calendar/meetings/${id}`, { credentials: 'include' });
      const j = await r.json().catch(() => null);
      const m = j?.meeting ?? j;
      out.meetings.push({
        id, status: r.status,
        topKeys: j ? Object.keys(j).slice(0, 24) : null,
        hasAttendees: m ? ('attendees' in m) : null,
        attendeesType: m ? (m.attendees === null ? 'null' : Array.isArray(m.attendees) ? `array(${m.attendees.length})` : typeof m.attendees) : null,
        attendees: Array.isArray(m?.attendees) ? m.attendees.map(a => ({ uid: (a.user_id || '').slice(-8), rsvp: a.rsvp_status, req: a.is_required })) : m?.attendees ?? null,
        hasParticipants: m ? ('participants' in m) : null,
        participantsType: m ? (m.participants === null ? 'null' : Array.isArray(m.participants) ? `array(${m.participants.length})` : typeof m.participants) : null,
        pcount: m?.participant_count ?? null,
        organizer: (m?.organizer_id ?? m?.created_by ?? '').slice(-8),
      });
    }
    return out;
  }, IDS);
};
