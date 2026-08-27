export default async ({ page }) => {
  return await page.evaluate(async () => {
    const r = await fetch('/api/v1/meetings/history?limit=100', {credentials:'include'});
    const j = await r.json(); const ms = j.meetings || [];
    const keys = new Set(); ms.forEach(m => Object.keys(m).forEach(k => keys.add(k)));
    const withEnd = ms.filter(m => m.end_reason !== undefined && m.end_reason !== '');
    const withMissed = ms.filter(m => m.missed_for_viewer !== undefined);
    return { total: ms.length, unionKeys: [...keys].sort(),
      hasEndReasonField: keys.has('end_reason'), hasMissedField: keys.has('missed_for_viewer'),
      rowsWithEndReason: withEnd.slice(0,6).map(m=>({ n:(m.name||'(no name)').slice(0,20), er:m.end_reason })),
      countWithEndReason: withEnd.length, countWithMissed: withMissed.length };
  });
};
