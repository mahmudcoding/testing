const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/privacy`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  return await page.evaluate(`(async () => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' ');
    // each picker with the label that precedes it, by vertical position
    const labels=[...main.querySelectorAll('*')].filter(e=>!e.children.length).filter(vis)
      .filter(e=>/^(Profile visibility|Online status|Last seen)$/.test((e.innerText||'').trim()))
      .map(e=>({ name:(e.innerText||'').trim(), y:e.getBoundingClientRect().top }));
    const pickers=[...main.querySelectorAll('button[aria-haspopup]')].filter(vis)
      .map(b=>({ value:(b.innerText||'').replace(/\\s+/g,' ').trim(), y:b.getBoundingClientRect().top }));
    const paired=labels.map(l=>{
      const p=pickers.filter(x=>Math.abs(x.y-l.y)<40).sort((a,b)=>Math.abs(a.y-l.y)-Math.abs(b.y-l.y))[0];
      return { setting:l.name, shown: p? p.value : null }; });
    const a=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return { onScreen: paired, stored: a.settings.privacy,
             sectionNote:(t.match(/These preferences[^.]*\\./)||[])[0]||null }; })()`);
};
