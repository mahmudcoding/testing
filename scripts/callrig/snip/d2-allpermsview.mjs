const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const nav = await page.evaluate(`(() => { const vis=(${VIS});
    const links=[...document.querySelectorAll('a[href*="/settings/"]')].filter(vis)
      .map(a=>(a.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean);
    const t=(document.body.innerText||'').replace(/\\s+/g,' ');
    const i=t.indexOf('ADMIN');
    return { adminGroup: i>=0? t.slice(i, i+90):null, allNav:[...new Set(links)] }; })()`);
  const screens={};
  for (const r of ['settings/admin/audit-log','settings/roles?scope=company','settings/admin/members','settings/admin/workspaces']) {
    await page.goto(`https://airion-cargo.store/w/${W}/${r}`, { waitUntil:'networkidle' });
    await page.waitForTimeout(2600);
    screens[r] = await page.evaluate(`(() => { const vis=(${VIS});
      const main=document.querySelector('main')||document.body;
      const t=(main.innerText||'').replace(/\\s+/g,' ');
      const ctl=[...main.querySelectorAll('button,a[href],input,[role=button]')].filter(vis)
        .filter(e=>e.getBoundingClientRect().left>300).length;
      return { refused:/Admin access required|do not have permission/i.test(t), controls:ctl }; })()`);
  }
  const api = await page.evaluate(`(async()=>{
    const g=async u=>{const r=await fetch(u,{credentials:'include'});return r.status;};
    return { companyAudit: await g('/api/v1/companies/O4QDF1XTURESO01/admin/audit-log?limit=2'),
             workspaceAudit: await g('/api/v1/workspaces/W4QDF1XTURESO01/admin/audit-log?limit=2'),
             companyRoles: await g('/api/v1/companies/O4QDF1XTURESO01/roles') };})()`);
  return { nav, screens, api };
};
