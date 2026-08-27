const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const out={};
  for (const wdt of [1280,1440]) {
    await page.setViewportSize({ width:wdt, height:900 });
    await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/members`, { waitUntil:'networkidle' });
    await page.waitForTimeout(2800);
    out[wdt] = await page.evaluate(`(() => { const vis=(${VIS});
      const de=document.documentElement;
      const main=document.querySelector('main')||document.body;
      const leaves=[...main.querySelectorAll('*')].filter(e=>!e.children.length).filter(vis);
      const clipped=leaves.filter(e=>e.scrollWidth>e.clientWidth+1)
        .map(e=>({ t:(e.innerText||'').trim().slice(0,34), sw:e.scrollWidth, cw:e.clientWidth }));
      return { viewport:innerWidth, sideways: de.scrollWidth>de.clientWidth,
               clippedCount:clipped.length, clipped:clipped.slice(0,4),
               offscreen: leaves.filter(e=>e.getBoundingClientRect().left>=innerWidth).length }; })()`);
  }
  await page.setViewportSize({ width:1280, height:900 });
  return out;
};
