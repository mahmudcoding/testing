const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ browser }) => {
  const W='W4QDF1XTURESO01';
  const EMAIL = process.env.D2_EMAIL || 'qa.d.guest@aloqa.test';
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  await p.goto('https://airion-cargo.store/login', { waitUntil:'networkidle' });
  await p.waitForTimeout(1500);
  await p.fill('input[name="email"]', EMAIL);
  await p.fill('input[name="password"]', 'QaPass123!');
  await p.evaluate(() => { const b=[...document.querySelectorAll('button[type=submit]')]; if(b.length) b[0].click(); });
  await p.waitForTimeout(6500);
  const me = await p.evaluate(async () => {
    const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return { email:j.email, name:j.name, is_guest:j.is_guest };
  });
  await p.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil:'networkidle' });
  await p.waitForTimeout(2800);
  const nav = await p.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('a[href*="/settings/"]')].filter(vis)
      .map(a=>(a.innerText||'').trim()).filter(Boolean); })()`);
  const pages={};
  for (const path of ['admin/members','admin/invites','admin/workspaces','admin/audit-log','admin/company','roles?scope=company','company','workspace']) {
    await p.goto(`https://airion-cargo.store/w/${W}/settings/${path}`, { waitUntil:'networkidle' });
    await p.waitForTimeout(1900);
    pages[path] = await p.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
      const t=(main.innerText||'').replace(/\\s+/g,' '); const i=t.lastIndexOf('›');
      const body=(i>=0?t.slice(i+1):t).trim();
      const ctl=[...main.querySelectorAll('button,input,select,[role=switch],[role=combobox]')].filter(vis)
        .filter(e=>e.getBoundingClientRect().left>300)
        .filter(e=>(e.getAttribute('placeholder')||'')!=='Filter settings');
      return { denied:/do not have permission|Admin access required|not allowed/i.test(body),
               controls:ctl.length, enabled:ctl.filter(e=>!(e.disabled===true||e.getAttribute('aria-disabled')==='true')).length,
               head:body.slice(0,110) }; })()`);
  }
  const api = await p.evaluate(async () => {
    const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
    const g=async u=>{const r=await fetch(u,{credentials:'include'});return {u:u.split('/api/v1')[1].slice(0,42),s:r.status};};
    return [ await g(`/api/v1/companies/${CO}/members?limit=5`), await g(`/api/v1/companies/${CO}/roles`),
             await g(`/api/v1/workspaces/${W}/admin/audit-log?limit=2`), await g(`/api/v1/workspaces/${W}/invites`),
             await g(`/api/v1/companies/${CO}/admin/audit-log?limit=2`) ];
  });
  await ctx.close();
  return { me, nav, pages, api };
};
