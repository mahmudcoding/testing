const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const who = await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01';
    const r = await fetch(`/api/v1/companies/${CO}/members?limit=100&offset=0`, { credentials:'include' });
    const j = await r.json(); const arr=j.members||j.items||[];
    const me = arr.find(m=>m.user_id==='U4QDALICE000001')||{};
    return { roles:(me.roles||[]).map(x=>x.name), perms:(me.roles||[]).flatMap(x=>x.permissions||[]) };
  });
  // 1. is Audit log in the settings nav?
  const nav = await page.evaluate(`(() => { const vis = ${VIS};
    return [...document.querySelectorAll('a[href*="/settings/"]')].filter(vis)
      .map(a=>(a.innerText||'').trim()).filter(Boolean); })()`);
  // 2. navigate to it directly
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/audit-log`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);
  const pageState = await page.evaluate(`(() => { const vis = ${VIS};
    const main=document.querySelector('main')||document.body;
    const navH=new Set([...document.querySelectorAll('a[href*="/settings/"]')].map(a=>a.getAttribute('href')));
    const items=[...main.querySelectorAll('button,input,select,textarea,[role=switch],[role=combobox],a')].filter(vis)
      .filter(e=>!(e.tagName==='A'&&navH.has(e.getAttribute('href'))))
      .filter(e=>(e.getAttribute('aria-label')||'')!=='Filter settings' && (e.getAttribute('placeholder')||'')!=='Filter settings')
      .map(e=>(e.getAttribute('aria-label')||e.innerText||e.getAttribute('placeholder')||'').trim().slice(0,40)).filter(Boolean);
    const t=(main.innerText||''); const i=t.lastIndexOf('›');
    return { interactiveOutsideNav: items, count: items.length,
             content:(i>=0?t.slice(i+1):t).replace(/\\n+/g,' | ').trim().slice(0,320) }; })()`);
  // 3. does the server give this account the log?
  const api = await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01', W='W4QDF1XTURESO01';
    const g = async u => { const r=await fetch(u,{credentials:'include'}); const t=await r.text();
      let n=null; try{ const j=JSON.parse(t); n=(j.entries||j.items||j.logs||[]).length; }catch{}
      return { s:r.status, entries:n, raw:t.slice(0,90) }; };
    return { company: await g(`/api/v1/companies/${CO}/admin/audit-log?limit=5`),
             workspace: await g(`/api/v1/workspaces/${W}/admin/audit-log?limit=5`) };
  });
  return { aliceCompanyRoles: who, adminNavItems: nav.filter(x=>/Audit|Members|Invites|Workspaces|dashboard/i.test(x)), pageState, api };
};
