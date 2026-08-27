const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/audit-log`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const ui = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const heads=[...main.querySelectorAll('th')].filter(vis).map(e=>(e.innerText||'').trim());
    const rows=[...main.querySelectorAll('tr')].filter(vis)
      .map(tr=>[...tr.querySelectorAll('td')].map(td=>(td.innerText||'').replace(/\\s+/g,' ').trim()))
      .filter(cells=>cells.length);
    return { heads, rowCount:rows.length, rows:rows.slice(0,10) }; })()`);
  const api = await page.evaluate(async () => {
    const W='W4QDF1XTURESO01';
    const r=await fetch(`/api/v1/workspaces/${W}/admin/audit-log?limit=40`,{credentials:'include'});
    const j=await r.json();
    const arr=Array.isArray(j)?j:(j.entries||j.items||[]);
    const types=[...new Set(arr.map(e=>e.action||e.event_type||e.type))];
    return { status:r.status, n:arr.length, types, sample:arr.slice(0,2) };
  });
  return { ui, api };
};
