const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const base=`https://airion-cargo.store/w/${W}/settings/admin/company`;
  await page.goto(base, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  const inv = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    return { text:(main.innerText||'').replace(/\\s+/g,' ').slice(0,420),
      controls:[...main.querySelectorAll('button,a[href]')].filter(vis)
        .filter(e=>e.getBoundingClientRect().left>300)
        .map(e=>({t:(e.innerText||'').trim().slice(0,40), tag:e.tagName.toLowerCase(),
                  href:e.getAttribute('href')||'', y:Math.round(e.getBoundingClientRect().top),
                  dis:e.disabled===true||e.getAttribute('aria-disabled')==='true'})) }; })()`);
  const results=[];
  for (const c of inv.controls.filter(x=>x.tag==='button' && !x.dis)) {
    await page.goto(base, { waitUntil:'networkidle' });
    await page.waitForTimeout(2200);
    const before = page.url();
    const clicked = await page.evaluate(`(() => { const vis=(${VIS});
      const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>(x.innerText||'').trim()===LBL);
      if(b.length!==1) return {n:b.length}; b[0].click(); return {n:1}; })()`.replace('LBL', JSON.stringify(c.t)));
    if (clicked.n!==1) { results.push({label:c.t, err:`matched ${clicked.n}`}); continue; }
    await page.waitForTimeout(2600);
    const after = await page.evaluate(`(() => { const vis=(${VIS});
      const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis);
      const main=document.querySelector('main')||document.body;
      const t=(main.innerText||'').replace(/\\s+/g,' ');
      const i=t.lastIndexOf('›');
      return { url:location.pathname, dialogs:dlg.length,
        dialogText: dlg[0]?(dlg[0].innerText||'').replace(/\\s+/g,' ').slice(0,150):'',
        heading:(i>=0?t.slice(i+1):t).trim().slice(0,90) }; })()`);
    results.push({ label:c.t, movedFrom:before.replace(/^https?:\/\/[^/]+/,''), ...after });
  }
  return { pageText:inv.text, buttons:inv.controls.map(c=>`${c.tag}:${c.t||c.href}${c.dis?' (disabled)':''}`), results };
};
