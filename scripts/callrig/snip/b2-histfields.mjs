export default async ({ page }) => {
  return await page.evaluate(async () => {
    const r = await fetch('/api/v1/meetings/history?limit=12', {credentials:'include'});
    const j = await r.json(); const ms = j.meetings || [];
    const keys = new Set(); ms.forEach(m => Object.keys(m).forEach(k => keys.add(k)));
    return { count: ms.length, allKeys: [...keys].sort(),
      rows: ms.slice(0,8).map(m => ({ name: (m.name||'(no name)').slice(0,22),
        status: m.status, end_reason: m.end_reason,
        missed_for_viewer: m.missed_for_viewer, direction: m.direction })) };
  });
};
