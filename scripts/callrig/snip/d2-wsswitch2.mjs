const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/c/C4QDGENERAL0001`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const before = await page.evaluate(`(() => { const vis=(${VIS});
    const rail=document.querySelector('nav');
    const railBtns=rail? [...rail.querySelectorAll('button,a[href]')].filter(vis)
      .map(b=>({ t:(b.innerText||'').replace(/\\s+/g,' ').trim().slice(0,18),
                 al:(b.getAttribute('aria-label')||'').slice(0,30),
                 href:(b.getAttribute('href')||'').slice(0,34) })) : [];
    return { railControls: railBtns }; })()`);
  // click whatever looks like the workspace badge at the top of the rail
  const opened = await page.evaluate(`(() => { const vis=(${VIS});
    const rail=document.querySelector('nav'); if(!rail) return 'no rail';
    const b=[...rail.querySelectorAll('button')].filter(vis)
      .sort((a,c)=>a.getBoundingClientRect().top-c.getBoundingClientRect().top)[0];
    if(!b) return 'no button'; b.click(); return 'clicked: '+((b.innerText||b.getAttribute('aria-label')||'').trim().slice(0,20)); })()`);
  await page.waitForTimeout(1800);
  const menu = await page.evaluate(`(() => { const vis=(${VIS});
    const dlg=[...document.querySelectorAll('[role=dialog],[role=menu],[data-state=open]')].filter(vis);
    const t=dlg.length? (dlg[0].innerText||'').replace(/\\s+/g,' ').slice(0,260) : null;
    return { openContainers: dlg.length, text: t,
             mentionsPersonal: /Alice/i.test(t||''), mentionsFixture: /Workspace D/i.test(t||'') }; })()`);
  await page.keyboard.press('Escape');
  return { before, opened, menu };
};
