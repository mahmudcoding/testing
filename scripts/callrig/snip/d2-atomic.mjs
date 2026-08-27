const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/appearance`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  return await page.evaluate(`(() => { const vis=(${VIS});
    const raw=localStorage.getItem('aloqa.appearance'); let p=null; try{p=JSON.parse(raw);}catch{}
    const main=document.querySelector('main')||document.body;
    const rs=[...main.querySelectorAll('[role=radio]')].filter(vis)
      .map(r=>({t:(r.innerText||'').trim(), on:r.getAttribute('aria-checked')}))
      .filter(o=>['Standard','Compact','Left','Right'].includes(o.t));
    // where is the workspace sidebar actually painted?
    const rail=[...document.querySelectorAll('nav,aside')].filter(vis)
      .map(e=>{const b=e.getBoundingClientRect(); return {x:Math.round(b.x), w:Math.round(b.width)};})
      .filter(o=>o.w>120&&o.w<420).sort((a,b)=>a.x-b.x);
    return { storedMsgLayout:p&&p.msgLayout, storedSidebarSide:p&&p.sidebarSide,
             storedDensity:p&&p.density, storedAccent:p&&p.accent,
             radios:rs, panels:rail, viewportW:innerWidth,
             cookieSidebar:(document.cookie.match(/aloqa\\.sidebar=([^;]*)/)||[])[1]||null }; })()`);
};
