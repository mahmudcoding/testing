export default async ({ page }) => {
  return await page.evaluate(() => {
    const p = window.__probe;
    if (!p) return { note: 'probe missing — page reloaded?' };
    const s = p.samples;
    const compress = (arr, key) => {
      const out = [];
      for (const x of arr) {
        const v = String(x[key]);
        if (!out.length || out[out.length - 1].v !== v) out.push({ v, from: x.ms, n: 1 });
        else { out[out.length - 1].n++; out[out.length - 1].to = x.ms; }
      }
      return out.map(o => `${o.v} x${o.n} (${o.from}-${o.to ?? o.from}ms)`);
    };
    return {
      n: s.length, spanMs: s.length ? s[s.length - 1].ms : 0,
      vis: [...new Set(s.map(x => x.vis))],
      srvTrack: compress(s, 'srv'),
      labelTrack: compress(s, 'label'),
      kidsTrack: compress(s, 'kids'),
    };
  });
};
