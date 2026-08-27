const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/c/C4QDGENERAL0001`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const before = await page.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button,[role=button]')].filter(vis)
      .filter(x=>(x.getAttribute('aria-label')||'')==='Open workspace menu')[0];
    return b? b.getAttribute('aria-expanded') : 'not found'; })()`);
  await page.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button,[role=button]')].filter(vis)
      .filter(x=>(x.getAttribute('aria-label')||'')==='Open workspace menu')[0];
    if(b) b.click(); })()`);
  await page.waitForTimeout(2000);
  const after = await page.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button,[role=button]')].filter(vis)
      .filter(x=>(x.getAttribute('aria-label')||'')==='Open workspace menu')[0];
    const dlg=[...document.querySelectorAll('[role=dialog],[role=menu],[data-radix-popper-content-wrapper]')].filter(vis);
    const txt=dlg.map(d=>(d.innerText||'').replace(/\\s+/g,' ')).join(' | ');
    const items=dlg.length? [...dlg[0].querySelectorAll('button,a[href],[role=menuitem]')].filter(vis)
      .map(e=>({t:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,30), href:(e.getAttribute('href')||'').slice(0,40)})) : [];
    return { expandedNow: b? b.getAttribute('aria-expanded'):null, containers:dlg.length,
             text: txt.slice(0,320), items,
             mentionsPersonalWorkspace: /Alice's workspace|Personal workspace/i.test(txt),
             hasCreateCompany: /Create a company/i.test(txt) }; })()`);
  await page.keyboard.press('Escape');
  return { expandedBefore:before, after };
};
