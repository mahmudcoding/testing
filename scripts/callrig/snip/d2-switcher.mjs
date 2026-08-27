const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/c/C4QDGENERAL0001`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  // any control whose label carries the company or workspace name
  const cands = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('button,[role=button]')].filter(vis)
      .filter(b=>/QA Fixtures D|QA Workspace D/.test((b.innerText||'')+(b.getAttribute('aria-label')||'')))
      .map(b=>({ text:(b.innerText||'').replace(/\\s+/g,' ').trim().slice(0,30),
                 aria:(b.getAttribute('aria-label')||'').slice(0,34),
                 expanded:b.getAttribute('aria-expanded'), haspopup:b.getAttribute('aria-haspopup'),
                 x:Math.round(b.getBoundingClientRect().left), y:Math.round(b.getBoundingClientRect().top) })); })()`);
  let opened=null;
  if (cands.length) {
    await page.evaluate(`(() => { const vis=(${VIS});
      const b=[...document.querySelectorAll('button,[role=button]')].filter(vis)
        .filter(x=>/QA Fixtures D|QA Workspace D/.test((x.innerText||'')+(x.getAttribute('aria-label')||'')))[0];
      if(b) b.click(); })()`);
    await page.waitForTimeout(1800);
    opened = await page.evaluate(`(() => { const vis=(${VIS});
      const dlg=[...document.querySelectorAll('[role=dialog],[role=menu],[data-radix-popper-content-wrapper]')].filter(vis);
      const txt=dlg.map(d=>(d.innerText||'').replace(/\\s+/g,' ')).join(' | ').slice(0,300);
      return { containers:dlg.length, text:txt,
               hasCreateCompany:/Create a company/i.test(txt),
               hasCompaniesHeading:/COMPANIES/i.test(txt),
               hasWorkspacesHeading:/WORKSPACES/i.test(txt) }; })()`);
    await page.keyboard.press('Escape');
  }
  return { candidates:cands, opened };
};
