const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  const clicked = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const b=[...main.querySelectorAll('button')].filter(vis).filter(e=>e.getBoundingClientRect().left>300)
      .filter(e=>/^(English|Русский|O'zbekcha|Ўзбекча)$/.test((e.innerText||'').trim()));
    if(b.length!==1) return {n:b.length}; b[0].click(); return {n:1, was:(b[0].innerText||'').trim()}; })()`);
  await page.waitForTimeout(1500);
  const opts = await page.evaluate(`(() => { const vis=(${VIS});
    const o=[...document.querySelectorAll('[role=option],[role=menuitem],[role=menuitemradio]')].filter(vis)
      .map(e=>({t:(e.innerText||'').replace(/\\s+/g,' ').trim(), sel:e.getAttribute('aria-selected')||e.getAttribute('aria-checked')||''}));
    return o; })()`);
  return { clicked, options:opts };
};
