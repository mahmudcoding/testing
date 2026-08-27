const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/invites`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const api = await page.evaluate(`(async()=>{
    const r=await fetch('/api/v1/workspaces/invites?workspace_id=W4QDF1XTURESO01',{credentials:'include'});
    const j=await r.json().catch(()=>null);
    const a=Array.isArray(j)?j:((j&&(j.invites||j.items))||[]);
    const by={}; a.forEach(x=>{ by[x.status||'?']=(by[x.status||'?']||0)+1; });
    return { status:r.status, total:a.length, byStatus:by };})()`);
  const ui = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const rows=[...main.querySelectorAll('tr')].filter(vis).filter(tr=>tr.querySelectorAll('td').length>=2);
    const ctl=[...main.querySelectorAll('button,a[href]')].filter(vis)
      .filter(e=>e.getBoundingClientRect().left>300)
      .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean);
    const t=(main.innerText||'').replace(/\\s+/g,' ');
    return { rowsRendered: rows.length, controls:[...new Set(ctl)].slice(0,12),
             pagerPresent: ctl.some(c=>/^(Next|Previous|Load more|Show more)$/i.test(c)),
             mentionsEmpty: /no invites|nothing|пока нет/i.test(t),
             textStart: t.slice(0,200) }; })()`);
  return { api, ui };
};
