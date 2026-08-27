const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const PATH = process.env.D2_PATH || 'privacy';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/${PATH}`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  return await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const els=[...main.querySelectorAll('button,input,select,textarea,[role=switch],[role=combobox],[role=radio],a[href]')]
      .filter(vis).filter(e=>e.getBoundingClientRect().left>300)
      .filter(e=>(e.getAttribute('placeholder')||'')!=='Filter settings');
    return { scrollHeight:document.documentElement.scrollHeight, innerHeight:innerHeight,
      controls: els.map(e=>{ const r=e.getBoundingClientRect();
        return { t:((e.innerText||'').trim().slice(0,22))||e.getAttribute('aria-label')||e.getAttribute('placeholder')||('<'+e.tagName.toLowerCase()+'>'),
                 absX:Math.round(r.x+scrollX), absY:Math.round(r.y+scrollY), w:Math.round(r.width) }; })
        .sort((a,b)=>a.absY-b.absY || a.absX-b.absX) }; })()`);
};
