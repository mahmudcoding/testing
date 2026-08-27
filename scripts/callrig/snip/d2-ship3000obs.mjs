const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/members`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3200);
  return await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' ');
    const rows=[...main.querySelectorAll('tr')].filter(vis)
      .map(tr=>({ cells:[...tr.querySelectorAll('td')].map(td=>(td.innerText||'').replace(/\\s+/g,' ').trim()),
                  buttons:[...tr.querySelectorAll('button')].filter(vis)
                    .map(b=>({t:(b.innerText||'').trim().slice(0,20), dis:b.disabled===true||b.getAttribute('aria-disabled')==='true'})) }))
      .filter(r=>r.cells.length>=2);
    const ownerRow = rows.find(r=>/QA Owner/i.test(r.cells.join(' ')));
    const selfRow  = rows.find(r=>/QA Alice/i.test(r.cells.join(' ')));
    return { listLoaded: rows.length>0, rowCount: rows.length,
             refusal: /Admin access required/i.test(t),
             notice: (t.match(/You can view[^.]*\\./)||[])[0]||null,
             ownerRowButtons: ownerRow? ownerRow.buttons : null,
             selfRowButtons: selfRow? selfRow.buttons : null }; })()`);
};
