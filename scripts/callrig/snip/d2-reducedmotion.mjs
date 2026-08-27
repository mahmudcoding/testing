const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const probe = () => page.evaluate(`(() => { const vis=(${VIS});
    const de=document.documentElement;
    // sample transition/animation durations actually in effect
    const els=[...document.querySelectorAll('button,a,[role=switch],[class*=transition]')].filter(vis).slice(0,60);
    let animated=0, total=0;
    for (const e of els) { const cs=getComputedStyle(e); total++;
      const td=(cs.transitionDuration||'0s').split(',').map(x=>parseFloat(x)||0);
      const ad=(cs.animationDuration||'0s').split(',').map(x=>parseFloat(x)||0);
      if (Math.max(...td, ...ad) > 0.01) animated++; }
    return { prefersReduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
             sampled: total, withMotion: animated,
             rootAttrs: { motion: de.getAttribute('data-motion'), reduced: de.getAttribute('data-reduced-motion') },
             bodyClass: (document.body.className||'').slice(0,80) }; })()`);
  const out={};
  await page.goto(`https://airion-cargo.store/w/${W}/settings/appearance`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForTimeout(1500);
  out.normal = await probe();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(1800);
  out.reduced = await probe();
  await page.reload({ waitUntil:'networkidle' });
  await page.waitForTimeout(2400);
  out.reducedAfterReload = await probe();
  await page.emulateMedia({ reducedMotion: null });
  return out;
};
