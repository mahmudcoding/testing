const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const LANG=process.env.D2_LANG||'en';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil:'networkidle' });
  await page.waitForTimeout(1500);
  await page.evaluate(`(async () => {
    const cur=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const s=cur.settings||{};
    await fetch('/api/v1/auth/me/settings',{method:'PUT',credentials:'include',
      headers:{'Content-Type':'application/json'},body:JSON.stringify({...s,language:${JSON.stringify(LANG)}})});
  })()`);
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/audit-log`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3200);
  const ui = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const heads=[...main.querySelectorAll('th')].filter(vis).map(e=>(e.innerText||'').trim());
    const rows=[...main.querySelectorAll('tr')].filter(vis)
      .map(tr=>[...tr.querySelectorAll('td')].map(td=>(td.innerText||'').replace(/\\s+/g,' ').trim()))
      .filter(c=>c.length>=4);
    const actions=[...new Set(rows.map(r=>r[0]))];
    const metaShapes=[...new Set(rows.map(r=>r[4]||'').map(m=>m.startsWith('{')?'RAW-JSON':(m?'text':'empty')))];
    return { heads, rowsRendered:rows.length, distinctActionCells:actions,
             metaShapes, metaSample:(rows.find(r=>(r[4]||'').startsWith('{'))||[])[4]||'' }; })()`);
  const apiActions = await page.evaluate(async () => {
    const W='W4QDF1XTURESO01';
    const r=await fetch(`/api/v1/workspaces/${W}/admin/audit-log?limit=100`,{credentials:'include'});
    const j=await r.json(); const a=Array.isArray(j)?j:(j.entries||[]);
    const c={}; for(const e of a){ c[e.action]=(c[e.action]||0)+1; }
    return { total:a.length, counts:c };
  });
  return { lang:LANG, ui, apiActions };
};
