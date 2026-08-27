const WS = 'W4QEF1XTURESO01', CH = 'C4QEGENERAL0001';
export default async ({ page }) => {
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  await page.goto(`https://airion-cargo.store/w/${WS}/directories`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  return await page.evaluate(({ WS, CH }) => {
    const readRow = () => {
      const row = [...document.querySelectorAll('a[href*="/c/"],button')]
        .find(e => (e.getAttribute('aria-label') || '').startsWith('qa-general'));
      return row ? {
        label: row.getAttribute('aria-label'),
        kids: [...row.children].map(c => c.tagName).join(','),
        txt: (row.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40),
      } : { label: null, kids: null, txt: null };
    };
    const srvRead = async () => {
      const r = await fetch(`/api/v1/workspaces/${WS}/unread`, { credentials: 'include' });
      const j = await r.json().catch(() => null);
      const hit = (j?.unread_counts ?? []).find(x => x.channel_id === CH);
      return hit ? hit.unread_count : 'CHANNEL-NOT-IN-RESPONSE';
    };
    window.__p2 = { samples: [], t0: performance.now() };
    window.__p2t = setInterval(async () => {
      const srv = await srvRead();
      const row = readRow();
      window.__p2.samples.push({ ms: Math.round(performance.now() - window.__p2.t0), srv, label: row.label, kids: row.kids, vis: document.visibilityState });
      if (window.__p2.samples.length > 110) clearInterval(window.__p2t);
    }, 300);
    return (async () => ({ url: location.pathname, baselineRow: readRow(), baselineSrv: await srvRead(), vis: document.visibilityState }))();
  }, { WS, CH });
};
