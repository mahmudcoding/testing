const WS = 'W4QEF1XTURESO01';
export default async ({ page }) => {
  await page.goto(`https://airion-cargo.store/w/${WS}/c/C4QEGENERAL0001`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  const api = await page.evaluate(async () => {
    const r = await fetch('/api/v1/notifications?limit=3', { credentials: 'include' });
    const j = await r.json().catch(() => null);
    const arr = Array.isArray(j) ? j : (j?.notifications ?? j?.items ?? []);
    return arr.slice(0, 2).map(n => ({
      event_type: n.event_type, title_key: n.title_key, title: n.title,
      has_body_key: 'body_key' in n, actor_name: n.actor_name,
      body: String(n.body ?? '').slice(0, 240), created_at: n.created_at,
    }));
  });
  const bell = await page.$('button[aria-label^="Notifications"]');
  const bellLabel = bell ? await bell.evaluate(el => el.getAttribute('aria-label')) : null;
  if (bell) { await bell.click(); await page.waitForTimeout(2500); }
  const ui = await page.evaluate(() => {
    const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const panel = [...document.querySelectorAll('[role="dialog"],aside,[data-testid*="notification" i]')].filter(vis)
      .sort((a, b) => b.innerText.length - a.innerText.length)[0];
    if (!panel) return { note: 'no panel' };
    const txt = (panel.innerText || '').replace(/\s+/g, ' ').trim();
    return {
      containsHttp: /https?:\/\//.test(txt),
      urlSeen: (txt.match(/https?:\/\/\S{0,90}/) || [null])[0],
      snippet: txt.slice(0, 420),
    };
  });
  return { bellLabel, api, ui };
};
