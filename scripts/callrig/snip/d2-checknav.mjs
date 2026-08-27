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
    return m?(m.roles||[]).flatMap(r=>r.permissions||[]):[]; });
  const nav = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('a[href*="/settings/"]')].filter(vis)
      .map(a=>(a.innerText||'').trim()).filter(Boolean)
      .filter(t=>/Company dashboard|Members|Invites|Workspaces|Audit log|Roles/.test(t)); })()`);
  const pages = {};
  for (const [name, path] of [['audit',`/w/${W}/settings/admin/audit-log`], ['invites',`/w/${W}/settings/admin/invites`],
                              ['members',`/w/${W}/settings/admin/members`], ['roles',`/w/${W}/settings/roles?scope=company`]]) {
    await page.goto('https://airion-cargo.store'+path, { waitUntil:'networkidle' });
    await page.waitForTimeout(2000);
    pages[name] = await page.evaluate(`(() => { const vis=(${VIS});
      const main=document.querySelector('main')||document.body;
      const navH=new Set([...document.querySelectorAll('a[href*="/settings/"]')].map(a=>a.getAttribute('href')));
      const n=[...main.querySelectorAll('button,input,select,textarea,[role=switch],[role=combobox]')].filter(vis)
        .filter(e=>(e.getAttribute('placeholder')||'')!=='Filter settings');
      const enabled=n.filter(e=>!(e.disabled===true||e.getAttribute('aria-disabled')==='true')).length;
      const t=(main.innerText||'');
      const denied=/do not have permission|Admin access required|not allowed/i.test(t);
      const i=t.lastIndexOf('\u203a');
      const body=(i>=0?t.slice(i+1):t).replace(/\\s+/g,' ').trim();
      return { controls:n.length, enabled, denied, chars: body.length,
               head: body.slice(0,70) }; })()`);
  }
  return { permissions: perms, adminNav: nav, pages };
};
