const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const NAV = `() => { const vis=(${VIS});
  return [...document.querySelectorAll('a[href*="/settings/"]')].filter(vis).map(a=>(a.innerText||'').trim()).filter(Boolean); }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/account', { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const box = page.locator('input[placeholder="Filter settings"]').first();
  if (!(await box.count())) return { err:'filter box not found' };
  const out = { navBefore: await page.evaluate(`(${NAV})()`) };
  const probe = async q => {
    await box.fill(q); await page.waitForTimeout(900);
    const nav = await page.evaluate(`(${NAV})()`);
    const empty = await page.evaluate(`(() => { const vis=(${VIS});
      const t=(document.body.innerText||'');
      return (t.match(/No settings[^.]*\\.|Nothing[^.]*\\.|No results[^.]*\\./)||[''])[0]; })()`);
    return { query:q, matches:nav, count:nav.length, emptyState:empty };
  };
  out.results = [];
  for (const q of ['appear', 'Notifications', 'audit', 'ZZZQQQ', 'Уведомления', 'sess']) out.results.push(await probe(q));
  await box.fill(''); await page.waitForTimeout(800);
  out.navAfterClear = await page.evaluate(`(${NAV})()`);
  out.restored = JSON.stringify(out.navAfterClear) === JSON.stringify(out.navBefore);
  return out;
};
