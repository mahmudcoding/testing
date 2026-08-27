const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const out={};
  const stored=`(() => { try { return JSON.parse(localStorage.getItem('aloqa.appearance')||'{}').sidebarSide; } catch { return null; } })()`;
  const layout=`(() => { const vis=(${VIS});
    const pick=sel=>{ const e=[...document.querySelectorAll(sel)].filter(vis)[0];
      if(!e) return null; const r=e.getBoundingClientRect();
      return { x:Math.round(r.left), right:Math.round(r.right), w:Math.round(r.width) }; };
    return { nav:pick('nav'), aside:pick('aside'), main:pick('main'), viewport:innerWidth }; })()`;
  await page.setViewportSize({ width:1920, height:1000 });
  await page.goto(`https://airion-cargo.store/w/${W}/settings/appearance`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  out.beforeStored = await page.evaluate(stored);
  // click Right in the Sidebar position group, scoped by the label's position
  out.click = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const lab=[...main.querySelectorAll('*')].filter(e=>!e.children.length).filter(vis)
      .find(e=>/^Sidebar position$/i.test((e.innerText||'').trim()));
    if(!lab) return {err:'label not found'};
    const ly=lab.getBoundingClientRect().top;
    const c=[...main.querySelectorAll('[role=radio]')].filter(vis)
      .filter(x=>(x.innerText||'').trim()==='Right')
      .map(x=>({el:x, dy:x.getBoundingClientRect().top-ly})).filter(c=>c.dy>=0)
      .sort((a,b)=>a.dy-b.dy);
    if(c.length!==1 && !(c.length && c[0].dy<120)) return {candidates:c.length};
    c[0].el.click(); return {clicked:true, dy:Math.round(c[0].dy)}; })()`);
  await page.waitForTimeout(1800);
  out.storedAfterClick = await page.evaluate(stored);
  // go to a channel page and measure where the panel actually sits
  await page.goto(`https://airion-cargo.store/w/${W}/c/C4QDGENERAL0001`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  out.layoutWithRight = await page.evaluate(layout);
  // restore
  await page.goto(`https://airion-cargo.store/w/${W}/settings/appearance`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2400);
  out.restore = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const lab=[...main.querySelectorAll('*')].filter(e=>!e.children.length).filter(vis)
      .find(e=>/^Sidebar position$/i.test((e.innerText||'').trim()));
    const ly=lab.getBoundingClientRect().top;
    const c=[...main.querySelectorAll('[role=radio]')].filter(vis)
      .filter(x=>(x.innerText||'').trim()==='Left')
      .map(x=>({el:x, dy:x.getBoundingClientRect().top-ly})).filter(c=>c.dy>=0)
      .sort((a,b)=>a.dy-b.dy)[0];
    if(c) { c.el.click(); return 'restored'; } return 'left radio not found'; })()`);
  await page.waitForTimeout(1500);
  out.storedAfterRestore = await page.evaluate(stored);
  await page.setViewportSize({ width:1280, height:900 });
  return out;
};
