const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const TARGET = process.env.D2_ROLE || 'D2 union W';
  const log=[];
  page.on('response', r => { const u=r.url(); if (/\/api\/v1\/(companies|workspaces)\/(roles|[A-Z0-9]+\/roles)/.test(u) &&
    r.request().method()!=='GET') log.push(`${r.request().method()} ${u.replace(/^https?:\/\/[^/]+/,'').slice(0,60)} -> ${r.status()}`); });
  await page.goto(`https://airion-cargo.store/w/${W}/settings/roles?scope=workspace`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  // find the row that contains the target name and exactly one Edit-ish control
  const opened = await page.evaluate(`(async () => { const vis=(${VIS}); const T=${JSON.stringify(TARGET)};
    const all=[...document.querySelectorAll('*')].filter(e=>e.children.length&&(e.innerText||'').includes(T));
    // smallest element still containing the name
    const host=all.sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
    if(!host) return {err:'name not found on page'};
    let n=host, row=null;
    while(n && n!==document.body){ const btns=[...n.querySelectorAll('button')].filter(vis);
      if(btns.length>=1){ row=n; break; } n=n.parentElement; }
    if(!row) return {err:'no row'};
    const btns=[...row.querySelectorAll('button')].filter(vis)
      .map(b=>({t:(b.innerText||'').trim(),al:b.getAttribute('aria-label')||''}));
    return { rowText:(row.innerText||'').replace(/\\s+/g,' ').slice(0,120), buttons:btns };
  })()`);
  return { targetRow: opened, requests: log };
};
