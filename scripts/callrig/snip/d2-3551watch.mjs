const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const MODE=process.env.D2_MODE||'open';
  const count = `(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' ');
    const people=[...new Set((t.match(/QA [A-Z][a-z]+/g)||[]))];
    return { peopleListed: people, count: people.length,
             hasOutsider: /QA Outsider/.test(t), url: location.pathname }; })()`;
  if (MODE==='open') {
    await page.goto(`https://airion-cargo.store/w/${W}/directories?tab=people`, { waitUntil:'networkidle' });
    await page.waitForTimeout(3000);
    return { opened: await page.evaluate(count) };
  }
  // MODE=poll — do NOT navigate; watch the page that is already open
  const seen=[]; const t0=Date.now();
  while (Date.now()-t0 < 25000) {
    seen.push(await page.evaluate(count));
    await page.waitForTimeout(500);
  }
  const appeared = seen.some(s=>s.hasOutsider);
  const before = seen[0], last = seen[seen.length-1];
  // now reload and look again
  await page.reload({ waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const afterReload = await page.evaluate(count);
  return { samples:seen.length, outsiderAppearedWithoutReload: appeared,
           first:before, last, afterReload };
};
