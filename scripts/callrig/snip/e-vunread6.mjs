export default async ({ page }) => {
  return await page.evaluate(() => {
    const p = window.__p3;
    if (!p) return { note: 'probe missing' };
    const s = p.samples;
    const compress = (arr, key) => {
      const out = [];
      for (const x of arr) {
        const v = String(x[key]);
        if (!out.length || out[out.length - 1].v !== v) out.push({ v, from: x.ms, to: x.ms, n: 1 });
        else { const l = out[out.length - 1]; l.n++; l.to = x.ms; }
      }
      return out.map(o => `${o.v} x${o.n} (${o.from}-${o.to}ms)`);
    };
    return {
      n: s.length, spanMs: s.length ? s[s.length - 1].ms : 0,
      srvTrack: compress(s, 'srv'), labelTrack: compress(s, 'label'),
      kidsTrack: compress(s, 'kids'), visTrack: compress(s, 'vis'),
      visibleWhileSrv2: s.filter(x => x.vis === 'visible' && x.srv === 2).length,
    };
  });
};
