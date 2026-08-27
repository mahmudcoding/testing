export default async ({ page }) => {
  return await page.evaluate(async () => {
    const r = await fetch('/api/v1/meetings/history?limit=100', {credentials:'include'});
    const j = await r.json(); const ms = j.meetings || [];
    const isDirect = m => !!m.channel_id && m.channel_id.startsWith('C4OU');
    const group = ms.filter(m => !isDirect(m));
    const direct = ms.filter(isDirect);
    const tally = arr => { const t = {}; for (const m of arr) {
      const k = m.end_reason === undefined ? '(field absent)' : (m.end_reason || '(empty)');
      t[k] = (t[k]||0)+1; } return t; };
    return { total: ms.length,
      groupCalls: { n: group.length, endReason: tally(group) },
      directCalls: { n: direct.length, endReason: tally(direct) },
      missedForViewerAnywhere: ms.some(m => m.missed_for_viewer !== undefined) };
  });
};
