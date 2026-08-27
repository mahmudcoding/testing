const WS = 'W4QEF1XTURESO01', CH = 'C4QEGENERAL0001';
export default async ({ page }) => {
  // 1. open the channel so it becomes read
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  // 2. move to a non-channel route and do not reload again
  await page.goto(`https://airion-cargo.store/w/${WS}/directories`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4500);
  // 3. baseline + install the poller BEFORE the trigger
  return await page.evaluate(({ WS, CH }) => {
    const readRow = () => {
      const els = [...document.querySelectorAll('a[href*="/c/"],button')];
      const row = els.find(e => (e.getAttribute('aria-label') || '').startsWith('qa-general'));
      if (!row) return { label: null, kids: null, txt: null };
      return {
        label: row.getAttribute('aria-label'),
        kids: [...row.children].map(c => c.tagName).join(','),
        txt: (row.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40),
      };
    };
    window.__probe = { samples: [], t0: performance.now(), vis: document.visibilityState };
    window.__probeTimer = setInterval(async () => {
      let srv = null;
      try {
        const r = await fetch(`/api/v1/workspaces/${WS}/unread`, { credentials: 'include' });
        const j = await r.json().catch(() => null);
        const arr = Array.isArray(j) ? j : (j?.channels ?? j?.unread ?? j?.items ?? []);
        const hit = arr.find(x => (x.channel_id ?? x.id) === CH);
        srv = hit ? (hit.unread_count ?? hit.count ?? hit.unread ?? null) : 0;
      } catch {}
      const row = readRow();
      window.__probe.samples.push({ ms: Math.round(performance.now() - window.__probe.t0), srv, label: row.label, kids: row.kids, vis: document.visibilityState });
      if (window.__probe.samples.length > 90) clearInterval(window.__probeTimer);
    }, 300);
    return { installed: true, url: location.pathname, baseline: readRow(), vis: document.visibilityState };
  }, { WS, CH });
};
