const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const MODE=process.env.D2_MODE||'open';
  const probe = `(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' ');
    return { hasProbeStatus: /D2-LIVE-PROBE/.test(t),
             peopleCount: [...new Set((t.match(/QA [A-Z][a-z]+/g)||[]))].length,
             url: location.pathname }; })()`;
  if (MODE==='open') {
    await page.goto(`https://airion-cargo.store/w/${W}/directories?tab=people`, { waitUntil:'networkidle' });
    await page.waitForTimeout(3000);
    return { opened: await page.evaluate(probe) };
  }
  const seen=[]; const t0=Date.now();
  while (Date.now()-t0 < 25000) { seen.push(await page.evaluate(probe)); await page.waitForTimeout(500); }
  const appeared = seen.some(s=>s.hasProbeStatus);
  await page.reload({ waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const afterReload = await page.evaluate(probe);
  return { samples:seen.length, appearedWithoutReload:appeared, last:seen[seen.length-1], afterReload };
};
