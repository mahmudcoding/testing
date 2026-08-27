const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2200);
  const perms = await page.evaluate(async () => {
    const j=await (await fetch('/api/v1/companies/O4QDF1XTURESO01/members?limit=100&offset=0',{credentials:'include'})).json();
    const a=j.members||j.items||[]; const m=a.find(x=>x.user_id==='U4QDALICE000001');
    return m?(m.roles||[]).map(r=>r.name+':'+(r.permissions||[]).length):[]; });
  const nav = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('a[href*="/settings/"]')].filter(vis).map(a=>(a.innerText||'').trim())
      .filter(t=>/Audit log|Members|Invites|Workspaces|Company dashboard|Roles/.test(t)); })()`);
  const pages={};
  for (const [n,p] of [['dashboard',`/w/${W}/settings/admin/company`],['members',`/w/${W}/settings/admin/members`],
                       ['invites',`/w/${W}/settings/admin/invites`],['workspaces',`/w/${W}/settings/admin/workspaces`],
                       ['audit',`/w/${W}/settings/admin/audit-log`],['roles',`/w/${W}/settings/roles?scope=company`]]) {
    await page.goto('https://airion-cargo.store'+p, { waitUntil:'networkidle' });
    await page.waitForTimeout(1900);
    pages[n]=await page.evaluate(`(() => { const vis=(${VIS});
      const main=document.querySelector('main')||document.body;
      const it=[...main.querySelectorAll('button,input,select,textarea,[role=switch],[role=combobox]')].filter(vis)
        .filter(e=>(e.getAttribute('placeholder')||'')!=='Filter settings');
      const t=(main.innerText||'');
      return { controls:it.length, enabled:it.filter(e=>!(e.disabled===true||e.getAttribute('aria-disabled')==='true')).length,
               denied:/do not have permission|Admin access required/i.test(t) }; })()`);
  }
  return { rolesHeld: perms, adminNav: nav, pages };
};
