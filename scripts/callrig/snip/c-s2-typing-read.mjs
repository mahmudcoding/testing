export default async ({page}) => {
  return await page.evaluate(() => {
    const r = window.__typRec;
    if (!r) return {err:'no recorder'};
    clearInterval(r.id);
    const withHits = r.samples.filter(s=>s.hits.length);
    return {total: r.samples.length, spanMs: r.samples.length? r.samples[r.samples.length-1].t:0,
      samplesWithHits: withHits.length,
      firstHit: withHits[0]||null, lastHit: withHits[withHits.length-1]||null,
      distinct: [...new Set(withHits.flatMap(s=>s.hits.map(h=>h.text+' | vis='+h.vis)))].slice(0,6)};
  });
};
