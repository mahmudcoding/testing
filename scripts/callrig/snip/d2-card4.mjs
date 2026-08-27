const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/d/C4OWQ0K3NB0XTRO`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const before = await page.evaluate(`(() => ({ body:(document.body.innerText||'').replace(/\\s+/g,' '),
    n:[...document.querySelectorAll('button,a')].filter(${VIS}).length }))()`);
  await page.evaluate(`(() => { const vis=(${VIS});
    const c=[...document.querySelectorAll('button')].filter(vis)
      .filter(e=>{const b=e.getBoundingClientRect(); return b.top<180 && b.left>380;})
      .filter(e=>(e.getAttribute('aria-label')||'')==='Profile');
    if(c.length===1) c[0].click(); })()`);
  await page.waitForTimeout(3200);
  const after = await page.evaluate(`(() => ({ body:(document.body.innerText||'').replace(/\\s+/g,' '),
    n:[...document.querySelectorAll('button,a')].filter(${VIS}).length,
    controls:[...document.querySelectorAll('button,a')].filter(${VIS})
      .map(e=>((e.innerText||'').trim()||e.getAttribute('aria-label')||'').slice(0,28)).filter(Boolean) }))()`);
  return { beforeLen:before.body.length, afterLen:after.body.length,
           beforeCtl:before.n, afterCtl:after.n,
           bodyAfter: after.body.slice(0,700),
           newControls: after.controls.filter(c=>c) .slice(0,26) };
};
