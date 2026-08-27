const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
  const out={};
  // M1 — company-scope events missing from the workspace audit page
  const seen=[];
  const h=r=>{ const u=r.url().replace(/^https?:\/\/[^/]+/,''); if(/admin\/audit-log/.test(u)) seen.push(u.slice(0,80)); };
  page.on('request', h);
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/audit-log`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  page.off('request', h);
  out.M1 = await page.evaluate(async () => {
    const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
    const g=async u=>{const r=await fetch(u,{credentials:'include'});const t=await r.text();
      let j=null;try{j=JSON.parse(t);}catch{}; return {s:r.status,j};};
    const ws=await g(`/api/v1/workspaces/${W}/admin/audit-log?limit=100`);
    const co=await g(`/api/v1/companies/${CO}/admin/audit-log?limit=100`);
    const arr=x=>Array.isArray(x.j)?x.j:((x.j&&x.j.entries)||[]);
    const scopes=a=>{const c={}; for(const e of a) c[e.scope_type]=(c[e.scope_type]||0)+1; return c;};
    return { wsEndpoint:{status:ws.s, n:arr(ws).length, scopes:scopes(arr(ws))},
             coEndpoint:{status:co.s, n:arr(co).length, scopes:scopes(arr(co))} };
  });
  out.M1.requestsMadeByThePage = [...new Set(seen)];
  // M4 — Workspace identity subtitle vs the fields actually present
  await page.goto(`https://airion-cargo.store/w/${W}/settings/workspace`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2500);
  out.M4 = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' ');
    return { subtitlePresent:/Name, URL, and default channel/i.test(t),
      mentionsUrlField:/\\bURL\\b/.test(t),
      fields:[...main.querySelectorAll('input,select,textarea')].filter(vis)
        .filter(e=>e.getBoundingClientRect().left>300)
        .map(e=>({name:e.getAttribute('name')||'', ph:e.getAttribute('placeholder')||'', v:String(e.value||'').slice(0,20)})),
      labels:[...main.querySelectorAll('label')].filter(vis).map(e=>(e.innerText||'').trim().slice(0,26)) }; })()`);
  // M3 — the raw audit.view key in the role permission list
  await page.goto(`https://airion-cargo.store/w/${W}/settings/roles?scope=company`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  out.M3 = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const labs=[...main.querySelectorAll('label')].filter(vis).map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim());
    return { rawKeyShown: labs.some(l=>/^audit\\.view$/.test(l)),
             auditLabels: labs.filter(l=>/audit/i.test(l)) }; })()`);
  return out;
};
