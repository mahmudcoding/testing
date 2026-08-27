const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/directories?tab=people`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const row = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    // controls on the row that names QA Alice
    const all=[...main.querySelectorAll('button,a[href],[role=button]')].filter(vis);
    const near=all.filter(b=>{ let n=b; for(let i=0;i<6&&n;i++){ n=n.parentElement; if(!n)break;
      if((n.innerText||'').includes('QA Alice')) return true; } return false; })
      .map(b=>({ t:(b.innerText||'').replace(/\\s+/g,' ').trim().slice(0,24),
                 aria:(b.getAttribute('aria-label')||'').slice(0,30) }));
    return { controlsOnAliceRow:[...new Set(near.map(x=>x.t||x.aria))].slice(0,10),
             pageMentionsOpenProfile: /open .*profile/i.test(main.innerText||'') }; })()`);
  // click the person's name/avatar and see whether a profile card opens
  const opened = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const el=[...main.querySelectorAll('button,a[href],[role=button]')].filter(vis)
      .filter(b=>/QA Alice/.test(b.innerText||''))[0];
    if(!el) return 'no clickable name'; el.click(); return 'clicked name'; })()`);
  await page.waitForTimeout(2200);
  const card = await page.evaluate(`(() => { const vis=(${VIS});
    const dlg=[...document.querySelectorAll('[role=dialog],[data-radix-popper-content-wrapper]')].filter(vis);
    const txt=dlg.map(d=>(d.innerText||'').replace(/\\s+/g,' ')).join(' | ');
    return { containers:dlg.length, text:txt.slice(0,240) }; })()`);
  await page.keyboard.press('Escape');
  return { row, opened, card };
};
