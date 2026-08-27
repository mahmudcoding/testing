const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/c/C4QDGENERAL0001`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  return await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('button,[role=button]')].filter(vis)
      .filter(b=>b.getAttribute('aria-haspopup') || /menu/i.test(b.getAttribute('aria-label')||''))
      .map(b=>({ aria:(b.getAttribute('aria-label')||'').slice(0,34),
                 text:(b.innerText||'').replace(/\\s+/g,' ').trim().slice(0,24),
                 haspopup:b.getAttribute('aria-haspopup'),
                 x:Math.round(b.getBoundingClientRect().left), y:Math.round(b.getBoundingClientRect().top) })); })()`);
};
