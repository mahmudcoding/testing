const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/audit-log`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  return await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const rows=[...main.querySelectorAll('tr')].filter(vis)
      .map(tr=>[...tr.querySelectorAll('td')].map(td=>(td.innerText||'').replace(/\\s+/g,' ').trim()))
      .filter(c=>c.length>=4);
    // rows whose metadata cell carries an ISO instant
    const withIso=rows.filter(c=>c.some(x=>/\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}/.test(x)));
    return {
      totalRows: rows.length,
      rowsWhoseMetadataCarriesIsoInstant: withIso.length,
      example: withIso.slice(0,2).map(c=>({ whenColumn: c.find(x=>/(AM|PM)/.test(x))||null,
        metadataCell: (c[c.length-1]||'').slice(0,220) }))
    };
  })()`);
};
