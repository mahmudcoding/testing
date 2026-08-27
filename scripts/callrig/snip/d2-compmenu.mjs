const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/company`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  const before = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const b=[...main.querySelectorAll('button')].filter(vis).filter(x=>(x.innerText||'').trim()==='QA Fixtures D')[0];
    return b? { expanded:b.getAttribute('aria-expanded'), haspopup:b.getAttribute('aria-haspopup') } : 'not found'; })()`);
  await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const b=[...main.querySelectorAll('button')].filter(vis).filter(x=>(x.innerText||'').trim()==='QA Fixtures D')[0];
    if(b) b.click(); })()`);
  await page.waitForTimeout(2000);
  const after = await page.evaluate(`(() => { const vis=(${VIS});
    const dlg=[...document.querySelectorAll('[role=dialog],[role=menu],[data-radix-popper-content-wrapper]')].filter(vis);
    const txt=dlg.map(d=>(d.innerText||'').replace(/\\s+/g,' ')).join(' | ');
    const items=dlg.length? [...dlg[0].querySelectorAll('button,a[href],[role=menuitem]')].filter(vis)
      .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,30)) : [];
    return { containers:dlg.length, text:txt.slice(0,260), items,
             hasCreateCompany:/Create a company/i.test(txt), hasCompanies:/COMPANIES/i.test(txt) }; })()`);
  await page.keyboard.press('Escape');
  return { before, after };
};
