const WS = 'W4QEF1XTURESO01', CH = 'C4QEGENERAL0001';
export default async ({ page }) => {
  return await page.evaluate(({ WS, CH }) => {
    const readRow = () => {
      const row = [...document.querySelectorAll('a[href*="/c/"],button')]
        .find(e => (e.getAttribute('aria-label') || '').startsWith('qa-general'));
      return row ? { label: row.getAttribute('aria-label'), kids: [...row.children].map(c => c.tagName).join(','), txt: (row.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40) } : { label: null };
    };
    const srvRead = async () => {
      const r = await fetch(`/api/v1/workspaces/${WS}/unread`, { credentials: 'include' });
      const j = await r.json().catch(() => null);
      const hit = (j?.unread_counts ?? []).find(x => x.channel_id === CH);
      return hit ? hit.unread_count : 'MISSING';
    };
    window.__p3 = { samples: [], t0: performance.now() };
    window.__p3t = setInterval(async () => {
      const srv = await srvRead(); const row = readRow();
      window.__p3.samples.push({ ms: Math.round(performance.now() - window.__p3.t0), srv, label: row.label, kids: row.kids, vis: document.visibilityState });
      if (window.__p3.samples.length > 110) clearInterval(window.__p3t);
    }, 300);
    return (async () => ({ url: location.pathname, row: readRow(), srv: await srvRead(), vis: document.visibilityState }))();
  }, { WS, CH });
};
