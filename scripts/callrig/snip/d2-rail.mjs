const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/c/C4QDGENERAL0001`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const enumerate = `(() => { const vis=(${VIS});
    const rail=document.querySelector('nav');
    if(!rail) return {err:'no nav'};
    return [...rail.querySelectorAll('button,a[href],[role=button]')].filter(vis)
      .sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top)
      .map(b=>({ y:Math.round(b.getBoundingClientRect().top),
                 text:(b.innerText||'').replace(/\\s+/g,' ').trim().slice(0,16),
                 aria:(b.getAttribute('aria-label')||'').slice(0,32),
                 expanded:b.getAttribute('aria-expanded'),
                 haspopup:b.getAttribute('aria-haspopup'),
                 href:(b.getAttribute('href')||'').slice(0,30) })); })()`;
  const rail = await page.evaluate(enumerate);
  // click the topmost one and prove whether its own state changed
  const res = await page.evaluate(`(() => { const vis=(${VIS});
    const rail=document.querySelector('nav');
    const b=[...rail.querySelectorAll('button,[role=button]')].filter(vis)
      .sort((a,c)=>a.getBoundingClientRect().top-c.getBoundingClientRect().top)[0];
    const before={ expanded:b.getAttribute('aria-expanded'), pressed:b.getAttribute('aria-pressed') };
    b.click();
    return { label:(b.innerText||b.getAttribute('aria-label')||'').trim().slice(0,20), before }; })()`);
  await page.waitForTimeout(1800);
  const after = await page.evaluate(`(() => { const vis=(${VIS});
    const rail=document.querySelector('nav');
    const b=[...rail.querySelectorAll('button,[role=button]')].filter(vis)
      .sort((a,c)=>a.getBoundingClientRect().top-c.getBoundingClientRect().top)[0];
    const dlg=[...document.querySelectorAll('[role=dialog],[role=menu],[data-state=open],[data-radix-popper-content-wrapper]')].filter(vis);
    return { expandedNow:b.getAttribute('aria-expanded'),
             openContainers:dlg.length,
             anyTextMentionsOtherWorkspace: dlg.map(d=>(d.innerText||'')).join(' ').includes('Alice'),
             url: location.pathname }; })()`);
  await page.keyboard.press('Escape');
  return { rail, clicked:res, after };
};
