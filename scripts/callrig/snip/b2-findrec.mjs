export default async ({ page }) => {
  return await page.evaluate(async () => {
    const r = await fetch('/api/v1/meetings/history?limit=60', {credentials:'include'});
    const j = await r.json(); const ms = j.meetings || [];
    const out = [];
    for (const m of ms.slice(0, 30)) {
      const e = await fetch(`/api/v1/meeting/${m.id}/events?limit=200`, {credentials:'include'});
      if (!e.ok) continue;
      const ej = await e.json(); const arr = Array.isArray(ej)?ej:(ej.events||ej.data||ej.items||[]);
      const rec = arr.filter(x => (x.event_type||'').startsWith('recording.'));
      if (rec.length) out.push({ id: m.id, name: m.name,
        types: [...new Set(rec.map(x=>x.event_type))] });
      if (out.length >= 3) break;
    }
    return out;
  });
};
