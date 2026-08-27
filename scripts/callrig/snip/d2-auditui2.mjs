const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/audit-log', { waitUntil:'networkidle' });
  await page.waitForTimeout(3500);
  return await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const rows=[...main.querySelectorAll('tr')].filter(vis);
    const header=rows.length?[...rows[0].querySelectorAll('th,td')].map(c=>(c.innerText||'').trim()):[];
    const body=rows.slice(1,9).map(r=>[...r.querySelectorAll('td,th')].map(c=>(c.innerText||'').trim().slice(0,34)));
    const txt=(main.innerText||'');
    const rawKeys=[...new Set((txt.match(/\\b(role|invite|company|workspace|channel)\\.[a-z_]+\\b/g)||[]))];
    return { header, rows: body, rawActionKeysVisible: rawKeys }; })()`);
};
