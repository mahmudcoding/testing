export default async ({page}) => {
  const WS='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/audit-log`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const dom = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>2&&r.height>2;};
    const m=document.querySelector('main');
    const navLinks=[...document.querySelectorAll('nav a, aside a')].filter(vis).map(a=>a.innerText.trim()).filter(Boolean);
    const t=(m.innerText||'').replace(/\s+/g,' ');
    return {heads:[...m.querySelectorAll('h1,h2,h3')].filter(vis).map(h=>h.innerText.trim()),
      adminNav: navLinks.filter(n=>['Company dashboard','Members','Invites','Workspaces','Audit log'].includes(n)),
      body: t.slice(t.indexOf('Settings ›'), t.indexOf('Settings ›')+380),
      contentControls:[...m.querySelectorAll('button,input')].filter(vis)
        .filter(e=>!/Filter settings/.test(e.placeholder||''))
        .map(e=>(e.innerText||e.getAttribute('aria-label')||'').trim()).filter(Boolean)};
  });
  const api = await page.evaluate(async ({WS,CO})=>{
    const g=async u=>{const r=await fetch(u,{credentials:'include'});const t=await r.text();return r.status+' '+t.slice(0,110);};
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const roles=await (await fetch(`/api/v1/users/me/roles?company_id=${CO}`,{credentials:'include'})).json();
    return {me:me.email,
      perms:(roles.roles||[]).map(r=>r.scope_type+':'+r.name+':'+(r.permissions||[]).join(',')),
      company: await g(`/api/v1/companies/${CO}/admin/audit-log?limit=2`),
      workspace: await g(`/api/v1/workspaces/${WS}/admin/audit-log?limit=2`)};
  }, {WS,CO});
  return {dom, api};
};
