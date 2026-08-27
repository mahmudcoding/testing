const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
// Walk the audit log the way a USER does — clicking Next — and collect every rendered row.
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/audit-log`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3200);
  const grab = `(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    return [...main.querySelectorAll('tr')].filter(vis).filter(tr=>tr.querySelectorAll('td').length>=3)
      .map(tr=>[...tr.querySelectorAll('td')].map(td=>(td.innerText||'').replace(/\\s+/g,' ').trim()))
      .map(c=>c.slice(0,4).join(' | ')); })()`;
  const next = `(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const b=[...main.querySelectorAll('button')].filter(vis).filter(x=>/^Next$/i.test((x.innerText||'').trim()));
    if(b.length!==1) return 'no-button';
    if(b[0].disabled) return 'disabled';
    b[0].click(); return 'clicked'; })()`;
  const all=[]; const perPage=[];
  for (let i=0;i<6;i++){
    const rows = await page.evaluate(grab);
    perPage.push(rows.length); all.push(...rows);
    const r = await page.evaluate(next);
    if (r!=='clicked') break;
    await page.waitForTimeout(3000);
  }
  const uniq=[...new Set(all)];
  const at608 = uniq.filter(r=>/6:08 PM/.test(r));
  return { perPage, totalRowsRendered: all.length, distinctRows: uniq.length,
           duplicatesAcrossPages: all.length - uniq.length,
           rowsAtBoundaryTimestamp: at608.length, sampleBoundaryRows: at608.slice(0,6) };
};
