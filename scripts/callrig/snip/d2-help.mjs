const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/c/C4QDGENERAL0001`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const btn = `(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button,[role=button]')].filter(vis)
      .filter(x=>(x.getAttribute('aria-label')||'')==='Help & resources')[0];
    return b; })()`;
  const before = await page.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button,[role=button]')].filter(vis)
      .filter(x=>(x.getAttribute('aria-label')||'')==='Help & resources')[0];
    return b? { found:true, expanded:b.getAttribute('aria-expanded'), haspopup:b.getAttribute('aria-haspopup') } : {found:false}; })()`);
  await page.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button,[role=button]')].filter(vis)
      .filter(x=>(x.getAttribute('aria-label')||'')==='Help & resources')[0];
    if(b) b.click(); })()`);
  await page.waitForTimeout(1800);
  const after = await page.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button,[role=button]')].filter(vis)
      .filter(x=>(x.getAttribute('aria-label')||'')==='Help & resources')[0];
    const dlg=[...document.querySelectorAll('[role=dialog],[role=menu],[data-radix-popper-content-wrapper]')].filter(vis);
    return { expandedNow: b? b.getAttribute('aria-expanded') : null,
             openContainers: dlg.length,
             text: dlg.length? (dlg[0].innerText||'').replace(/\\s+/g,' ').slice(0,240) : null,
             links: dlg.length? [...dlg[0].querySelectorAll('a[href]')].filter(vis)
               .map(a=>({t:(a.innerText||'').trim().slice(0,26), href:a.getAttribute('href').slice(0,50)})) : [] }; })()`);
  await page.keyboard.press('Escape');
  return { before, after };
};
