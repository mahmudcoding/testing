export default async ({page}) => {
  const rx = new RegExp(process.env.QA_RX || '.', 'i');
  const since = Number(process.env.QA_SINCE || 0);
  return await page.evaluate(([r, s]) => {
    const re = new RegExp(r, 'i');
    const log = window.__wsLog || [];
    const hits = log.filter(x => x.t >= s && x.d && re.test(x.d))
      .map(x => ({t: x.t, dir: x.dir, d: x.d.slice(0, 400)}));
    const types = {};
    for (const x of log) { if (!x.d) continue;
      const m = x.d.match(/"type"\s*:\s*"([^"]+)"/); if (m) types[m[1]] = (types[m[1]]||0)+1; }
    return {total: log.length, hooked: !!window.__wsHooked, hits: hits.slice(-25), types};
  }, [rx.source, since]);
}
