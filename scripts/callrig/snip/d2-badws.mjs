const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const cases = [
    ['bogus-but-wellformed', '/w/W4QDF1XTURESO09/chat'],
    ['bogus-short',          '/w/NOPE/chat'],
    ['bogus-settings',       '/w/W4QDF1XTURESO09/settings/account'],
    ['real-ws-control',      '/w/W4QDF1XTURESO01/chat'],
  ];
  const res=[];
  for (const [name, path] of cases) {
    const codes=[];
    const h = r => { const u=r.url().replace(/^https?:\/\/[^/]+/,''); if(/\/api\/v1\//.test(u)) codes.push(`${r.status()} ${u.slice(0,52)}`); };
    page.on('response', h);
    await page.goto('https://airion-cargo.store'+path, { waitUntil:'networkidle' });
    await page.waitForTimeout(2600);
    const ui = await page.evaluate(`(() => { const vis=(${VIS});
      const t=(document.body.innerText||'').replace(/\\s+/g,' ').trim();
      const ctl=[...document.querySelectorAll('button,a[href]')].filter(vis).length;
      return { url:location.pathname, chars:t.length, head:t.slice(0,170),
               notFound:/not found|404|does not exist|no longer|unavailable/i.test(t), controls:ctl }; })()`);
    page.off('response', h);
    res.push({ name, ui, apiCodes: codes.slice(0,7) });
  }
  return res;
};
