const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/workspace`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2400);
  const api = await page.evaluate(`(async()=>{
    const g=async u=>{const r=await fetch(u,{credentials:'include'});
      const j=await r.json().catch(()=>null); return {s:r.status,j};};
    const ws=await g('/api/v1/users/me/workspaces');
    const co=await g('/api/v1/users/me/companies');
    const list=x=>Array.isArray(x)?x:((x&&(x.workspaces||x.companies||x.items))||[]);
    return { workspaces:list(ws.j).map(w=>({id:w.id,name:w.name,personal:w.is_personal??null})),
             workspacesStatus:ws.s,
             companies:list(co.j).map(c=>({id:c.id,name:c.name})), companiesStatus:co.s };})()`);
  const ui = await page.evaluate(`(() => { const vis=(${VIS});
    const t=(document.body.innerText||'').replace(/\\s+/g,' ');
    const switchers=[...document.querySelectorAll('button,[role=button]')].filter(vis)
      .map(b=>(b.innerText||b.getAttribute('aria-label')||'').replace(/\\s+/g,' ').trim())
      .filter(x=>/switch|workspace|company/i.test(x)).slice(0,10);
    return { controlsMentioningSwitch:[...new Set(switchers)],
             mentionsSwitchCompany:/Switch company/i.test(t) }; })()`);
  return { api, ui };
};
