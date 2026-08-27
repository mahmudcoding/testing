const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const perms = await (async () => { await page.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil:'networkidle' });
    await page.waitForTimeout(2000);
    return page.evaluate(async () => {
      const j=await (await fetch('/api/v1/workspaces/W4QDF1XTURESO01/members?limit=50',{credentials:'include'})).json();
      const a=j.members||j.items||[]; const m=a.find(x=>x.user_id==='U4QDALICE000001');
      return m?(m.roles||[]).flatMap(r=>r.permissions||[]):[]; }); })();
  const pages={};
  for (const [name,path] of [['workspace',`/w/${W}/settings/workspace`], ['adminWorkspaces',`/w/${W}/settings/admin/workspaces`],
                             ['invites',`/w/${W}/settings/admin/invites`]]) {
    await page.goto('https://airion-cargo.store'+path, { waitUntil:'networkidle' });
    await page.waitForTimeout(2200);
    pages[name]=await page.evaluate(`(() => { const vis=(${VIS});
      const main=document.querySelector('main')||document.body;
      const items=[...main.querySelectorAll('button,input,select,textarea,[role=switch],[role=combobox]')].filter(vis)
        .filter(e=>(e.getAttribute('placeholder')||'')!=='Filter settings')
        .map(e=>({ l:(e.getAttribute('aria-label')||e.innerText||'').trim().slice(0,30), d:e.disabled===true }));
      const t=(main.innerText||'');
      return { controls:items.length, enabled:items.filter(x=>!x.d).length,
               denied:/do not have permission|Admin access required/i.test(t),
               deleteLike: items.filter(x=>/delete|remove|archive/i.test(x.l)).map(x=>x.l),
               labels: items.map(x=>x.l+(x.d?'[dis]':'')).slice(0,10) }; })()`);
  }
  return { permissions: perms, pages };
};
