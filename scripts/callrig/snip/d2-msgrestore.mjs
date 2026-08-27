const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/appearance`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const label=[...main.querySelectorAll('*')].filter(e=>!e.children.length).filter(vis)
      .find(e=>(e.innerText||'').trim()==='Message layout');
    const ly=label.getBoundingClientRect().top;
    const c=[...main.querySelectorAll('[role=radio]')].filter(vis)
      .filter(x=>(x.innerText||'').trim()==='Standard')
      .map(x=>({el:x, dy:x.getBoundingClientRect().top-ly})).filter(c=>c.dy>=0)
      .sort((a,b)=>a.dy-b.dy)[0];
    if(c) c.el.click(); })()`);
  await page.waitForTimeout(1600);
  return await page.evaluate(`(() => { try { return JSON.parse(localStorage.getItem('aloqa.appearance')||'{}'); } catch { return {}; } })()`);
};
