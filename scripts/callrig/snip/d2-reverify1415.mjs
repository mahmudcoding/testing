const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/invites`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3200);
  return await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' ');
    const rows=[...main.querySelectorAll('tr')].filter(vis)
      .map(tr=>[...tr.querySelectorAll('td')].map(td=>(td.innerText||'').replace(/\\s+/g,' ').trim()))
      .filter(c=>c.length>=3);
    const roleCells=rows.map(c=>c[1]).filter(Boolean);
    return {
      // finding 14: rows showing "Role unavailable"
      roleColumnValues: [...new Set(roleCells)],
      rowsSayingRoleUnavailable: roleCells.filter(x=>/Role unavailable/i.test(x)).length,
      totalRows: rows.length,
      // finding 15: the caption promising in-app acceptance
      captionAboutEmail: (t.match(/Use the invite link[^.]*\\./)||[])[0]||null,
      captionAboutAccept: (t.match(/[^.]*accept or decline[^.]*\\./)||[])[0]||null,
      mentionsInApp: /in the app|в приложении/i.test(t)
    }; })()`);
};
