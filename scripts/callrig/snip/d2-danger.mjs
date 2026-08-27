const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  return await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' ');
    const btns=[...main.querySelectorAll('button')].filter(vis)
      .filter(b=>/Deactivate|Delete/i.test(b.innerText||''))
      .map(b=>({ t:(b.innerText||'').trim().slice(0,26),
                 disabled:b.disabled===true||b.getAttribute('aria-disabled')==='true',
                 title:(b.getAttribute('title')||'').slice(0,30) }));
    return { dangerZoneText:(t.match(/Danger zone[^]{0,140}/)||[])[0]||null, buttons:btns }; })()`);
};
