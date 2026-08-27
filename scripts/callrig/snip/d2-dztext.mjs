const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/workspace`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  return await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const leaves=[...main.querySelectorAll('*')].filter(e=>!e.children.length).filter(vis)
      .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean);
    const i=leaves.findIndex(t=>/Danger zone/i.test(t));
    return { dangerZone: i>=0 ? leaves.slice(i, i+8) : leaves.slice(-8),
             interactiveInDanger: (()=>{ const all=[...main.querySelectorAll('button,a[href],input,select')].filter(vis)
               .filter(e=>e.getBoundingClientRect().top>480)
               .map(e=>({t:(e.innerText||'').trim().slice(0,40), tag:e.tagName.toLowerCase(),
                         dis:e.disabled===true||e.getAttribute('aria-disabled')==='true'})); return all; })() }; })()`);
};
