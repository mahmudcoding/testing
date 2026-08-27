export default async ({ page }) => {
  const p = await page.evaluate(() => {
    const p = window.__p2;
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
      visibleSamplesAfterSrv1: s.filter(x => x.vis === 'visible' && x.srv === 1).length,
      badgeEverAppeared: s.some(x => x.label && /unread/.test(x.label)),
    };
  });
  // now reload and read the same row
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  const afterReload = await page.evaluate(() => {
    const row = [...document.querySelectorAll('a[href*="/c/"],button')]
      .find(e => (e.getAttribute('aria-label') || '').startsWith('qa-general'));
    return row ? { label: row.getAttribute('aria-label'), kids: [...row.children].map(c => c.tagName).join(','), txt: (row.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40) } : null;
  });
  return { poll: p, afterReload };
};
