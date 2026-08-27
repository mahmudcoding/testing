const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const MODE=process.env.D2_MODE||'open';
  const probe = `(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const rows=[...main.querySelectorAll('tr')].filter(vis)
      .map(tr=>[...tr.querySelectorAll('td')].map(td=>(td.innerText||'').replace(/\\s+/g,' ').trim()))
      .filter(c=>c.length>=2);
    const carol=rows.find(c=>/Carol/i.test(c.join(' ')));
    return { rows:rows.length, carolRow: carol? carol.join(' | ').slice(0,80):null,
             hasProbeRole: /D2 live role/.test((main.innerText||'')) }; })()`;
  if (MODE==='open') {
    await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/members`, { waitUntil:'networkidle' });
    await page.waitForTimeout(3000);
    return { opened: await page.evaluate(probe) };
  }
  const seen=[]; const t0=Date.now();
  while (Date.now()-t0 < 25000) { seen.push(await page.evaluate(probe)); await page.waitForTimeout(500); }
  await page.reload({ waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  return { samples:seen.length, appearedWithoutReload: seen.some(s=>s.hasProbeRole),
           last:seen[seen.length-1], afterReload: await page.evaluate(probe) };
};
