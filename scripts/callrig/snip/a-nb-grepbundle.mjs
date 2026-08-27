export default async ({page}) => {
  const needles = JSON.parse(process.env.QA_NEEDLES || '[]');
  return await page.evaluate(async (ns) => {
    const urls = performance.getEntriesByType('resource')
      .map(e => e.name).filter(u => /\.js(\?|$)/.test(u));
    const hits = {}; ns.forEach(n => hits[n] = []);
    let scanned = 0;
    for (const u of urls) {
      let t = '';
      try { t = await (await fetch(u)).text(); } catch(e) { continue; }
      scanned++;
      for (const n of ns) if (t.includes(n)) hits[n].push(u.split('/').pop().slice(0,40));
    }
    return {scanned, total: urls.length, hits};
  }, needles);
}
