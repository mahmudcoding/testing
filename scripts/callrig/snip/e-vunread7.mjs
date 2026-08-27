const WS = 'W4QEF1XTURESO01', CH = 'C4QEGENERAL0001';
export default async ({ page }) => {
  const samples = [];
  for (let i = 0; i < 34; i++) {
    samples.push(await page.evaluate(async ({ WS, CH }) => {
      const r = await fetch(`/api/v1/workspaces/${WS}/unread`, { credentials: 'include' });
      const j = await r.json().catch(() => null);
      const hit = (j?.unread_counts ?? []).find(x => x.channel_id === CH);
      const row = [...document.querySelectorAll('a[href*="/c/"],button')]
        .find(e => (e.getAttribute('aria-label') || '').startsWith('qa-general'));
      return {
        srv: hit ? hit.unread_count : 'MISSING',
        label: row ? row.getAttribute('aria-label') : null,
        kids: row ? [...row.children].map(c => c.tagName).join(',') : null,
        vis: document.visibilityState,
      };
    }, { WS, CH }));
    await page.waitForTimeout(300);
  }
  const compress = (arr, key) => {
    const out = [];
    for (const x of arr) { const v = String(x[key]); if (!out.length || out[out.length - 1].v !== v) out.push({ v, n: 1 }); else out[out.length - 1].n++; }
    return out.map(o => `${o.v} x${o.n}`);
  };
  return {
    n: samples.length,
    srvTrack: compress(samples, 'srv'), labelTrack: compress(samples, 'label'),
    kidsTrack: compress(samples, 'kids'), visTrack: compress(samples, 'vis'),
    visibleWhileMismatch: samples.filter(s => s.vis === 'visible' && s.srv === 2 && /1 unread/.test(s.label || '')).length,
  };
};
