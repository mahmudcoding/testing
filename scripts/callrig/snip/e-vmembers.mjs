const WS = 'W4QEF1XTURESO01';
export default async ({ page }) => {
  if (!page.url().includes('airion-cargo')) await page.goto('https://airion-cargo.store/', { waitUntil: 'domcontentloaded' });
  return await page.evaluate(async (WS) => {
    const out = {};
    const r = await fetch(`/api/v1/workspaces/${WS}/members`, { credentials: 'include' });
    out.membersStatus = r.status;
    const j = await r.json().catch(() => null);
    const arr = Array.isArray(j) ? j : (j?.members ?? j?.items ?? j?.data ?? []);
    out.members = arr.slice(0, 10).map(m => ({
      id: (m.user_id ?? m.id ?? '').slice(-8),
      name: m.display_name ?? m.user?.display_name ?? m.name ?? null,
      username: m.username ?? m.user?.username ?? null,
    }));
    const rc = await fetch(`/api/v1/workspaces/${WS}/channels`, { credentials: 'include' });
    out.chStatus = rc.status;
    const cj = await rc.json().catch(() => null);
    const ca = Array.isArray(cj) ? cj : (cj?.channels ?? cj?.items ?? cj?.data ?? []);
    out.channels = ca.slice(0, 10).map(c => ({ id: (c.id ?? '').slice(-8), name: c.name ?? null, type: c.type ?? c.channel_type ?? null }));
    return out;
  }, WS);
};
