const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ browser }) => {
  const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  await p.goto('https://airion-cargo.store/login', { waitUntil:'networkidle' });
  await p.waitForTimeout(1500);
  await p.fill('input[name="email"]', 'qa.d.admin@aloqa.test');
  await p.fill('input[name="password"]', 'QaPass123!');
  await p.evaluate(() => { const b=[...document.querySelectorAll('button[type=submit]')]; if(b.length) b[0].click(); });
  await p.waitForTimeout(6500);
  const me = await p.evaluate(async () => {
    const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const CO='O4QDF1XTURESO01';
    const m=await (await fetch(`/api/v1/companies/${CO}/members?limit=100&offset=0`,{credentials:'include'})).json();
    const arr=m.members||m.items||[];
    const self=arr.find(x=>x.user_id==='U4QDADMIN000001');
    return { email:j.email, roles:self?(self.roles||[]).map(r=>r.name):null,
             perms:self?(self.roles||[]).flatMap(r=>r.permissions||[]):null };
  });
  const nav = await (async()=>{ await p.goto(`https://airion-cargo.store/w/${W}/settings/account`,{waitUntil:'networkidle'});
    await p.waitForTimeout(2400);
    return p.evaluate(`(() => { const vis=(${VIS});
      return [...document.querySelectorAll('a[href*="/settings/"]')].filter(vis).map(a=>(a.innerText||'').trim())
        .filter(t=>/Company dashboard|Members|Invites|Workspaces|Audit log|Roles/.test(t)); })()`); })();
  const pages={};
  for (const [k,path] of [['audit','admin/audit-log'],['roles','roles?scope=company'],['members','admin/members'],['invites','admin/invites']]) {
    await p.goto(`https://airion-cargo.store/w/${W}/settings/${path}`, { waitUntil:'networkidle' });
    await p.waitForTimeout(2200);
    pages[k] = await p.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
      const t=(main.innerText||'').replace(/\\s+/g,' '); const i=t.lastIndexOf('›');
      const body=(i>=0?t.slice(i+1):t).trim();
      const ctl=[...main.querySelectorAll('button,input,select,[role=combobox]')].filter(vis)
        .filter(e=>e.getBoundingClientRect().left>300)
        .filter(e=>(e.getAttribute('placeholder')||'')!=='Filter settings');
      return { denied:/do not have permission|Admin access required/i.test(body),
               controls:ctl.length, enabled:ctl.filter(e=>!(e.disabled===true||e.getAttribute('aria-disabled')==='true')).length,
               head:body.slice(0,100) }; })()`);
  }
  const api = await p.evaluate(async () => {
    const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
    const g=async u=>{const r=await fetch(u,{credentials:'include'});return {s:r.status};};
    return { companyAudit: await g(`/api/v1/companies/${CO}/admin/audit-log?limit=2`),
             wsAudit: await g(`/api/v1/workspaces/${W}/admin/audit-log?limit=2`) };
  });
  await ctx.close();
  return { me, nav, pages, api };
};
