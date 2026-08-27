export default async ({ page }) => {
  return await page.evaluate(async () => {
    const r = await fetch('/api/v1/meetings/history?limit=40', {credentials:'include'});
    const j = await r.json();
    const ms = j.meetings || [];
    const direct = ms.filter(m => m.channel_id && m.channel_id.startsWith('C4OU'));
    const group  = ms.filter(m => !m.channel_id);
    return { totalFetched: ms.length,
             firstDirect: direct[0] ? { id:direct[0].id, name:direct[0].name, ch:direct[0].channel_id } : null,
             directCount: direct.length, groupCount: group.length };
  });
};
