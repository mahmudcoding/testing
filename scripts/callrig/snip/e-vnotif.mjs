export default async ({ page }) => {
  if (!page.url().includes('airion-cargo')) await page.goto('https://airion-cargo.store/', { waitUntil: 'domcontentloaded' });
  return await page.evaluate(async () => {
    const r = await fetch('/api/v1/notifications?limit=6', { credentials: 'include' });
    const j = await r.json().catch(() => null);
    const arr = Array.isArray(j) ? j : (j?.notifications ?? j?.items ?? j?.data ?? []);
    return {
      status: r.status,
      fields: arr[0] ? Object.keys(arr[0]) : null,
      items: arr.slice(0, 5).map(n => ({
        type: n.type ?? null, event_type: n.event_type ?? null,
        title_key: n.title_key ?? null, title: n.title ?? null,
        body_key: n.body_key ?? ('body_key' in n ? n.body_key : 'ABSENT'),
        actor_name: n.actor_name ?? null,
        body: String(n.body ?? '').slice(0, 260),
        created_at: n.created_at ?? null, read: n.read ?? null,
      })),
    };
  });
};
