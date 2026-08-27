const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/audit-log`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3200);
  // how much history actually exists, walked by cursor
  const api = await page.evaluate(async () => {
    const W='W4QDF1XTURESO01';
    const get=async u=>{const r=await fetch(u,{credentials:'include'});const j=await r.json().catch(()=>null);return j;};
    const rows=j=>Array.isArray(j)?j:((j&&j.entries)||[]);
    let total=0, pages=0, cursor=null, oldest=null;
    for (let i=0;i<6;i++){
      const u=`/api/v1/workspaces/${W}/admin/audit-log?limit=100`+(cursor?`&before=${encodeURIComponent(cursor)}`:'');
      const j=await get(u); const r=rows(j);
      if(!r.length) break;
      total+=r.length; pages++;
      oldest=r[r.length-1].created_at;
      cursor=(j&&j.next_cursor)||oldest;
      if(r.length<100) break;
    }
    return { entriesReachableByApi: total, pagesWalked: pages, oldestSeen: oldest };
  });
  const ui = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const rows=[...main.querySelectorAll('tr')].filter(vis)
      .filter(tr=>tr.querySelectorAll('td').length>=3);
    const btns=[...main.querySelectorAll('button,a[href]')].filter(vis)
      .map(b=>(b.innerText||b.getAttribute('aria-label')||'').replace(/\\s+/g,' ').trim())
      .filter(Boolean);
    const t=(main.innerText||'').replace(/\\s+/g,' ');
    const sc=[...document.querySelectorAll('*')].filter(e=>{const s=getComputedStyle(e);
      return e.scrollHeight-e.clientHeight>40 && /auto|scroll/.test(s.overflowY) && vis(e);});
    return { rowsRendered: rows.length,
             controlsInArea: [...new Set(btns)].slice(0,14),
             pagerWords: /load more|show more|next|older|previous|page \\d|показать ещё/i.test(t),
             scrollContainers: sc.length,
             firstRow: rows.length? [...rows[0].querySelectorAll('td')].map(td=>(td.innerText||'').trim().slice(0,22)) : null,
             lastRow:  rows.length? [...rows[rows.length-1].querySelectorAll('td')].map(td=>(td.innerText||'').trim().slice(0,22)) : null }; })()`);
  return { api, ui };
};
