export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/c/C4QDGENERAL0001', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);
  return await page.evaluate(() => {
    let stored = {}; try { stored = JSON.parse(localStorage.getItem('aloqa.appearance')||'{}'); } catch {}
    const box = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect();
      return { x: Math.round(r.x), right: Math.round(r.right), w: Math.round(r.width) }; };
    const aside = document.querySelector('aside');
    return { storedSidebarSide: stored.sidebarSide, viewport: window.innerWidth,
      rail: box('nav.app-shell-rail') || box('nav'), sidebar: box('aside'), main: box('main'),
      sidebarClass: aside ? (aside.className||'').toString().slice(0,70) : null,
      order: [['rail', (box('nav')||{}).x], ['sidebar', (box('aside')||{}).x], ['main', (box('main')||{}).x]]
        .filter(p => p[1] !== undefined).sort((a,b)=>a[1]-b[1]).map(p=>p[0]).join(' < ') };
  });
};
