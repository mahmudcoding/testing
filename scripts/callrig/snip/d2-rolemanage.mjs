const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/roles?scope=company`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3200);
  const ui = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const navH=new Set([...document.querySelectorAll('a[href*="/settings/"]')].map(a=>a.getAttribute('href')));
    const items=[...main.querySelectorAll('button,input,select,textarea,[role=combobox]')].filter(vis)
      .filter(e=>(e.getAttribute('placeholder')||'')!=='Filter settings')
      .map(e=>({ tag:e.tagName.toLowerCase(), label:(e.getAttribute('aria-label')||e.innerText||'').trim().slice(0,34), dis:e.disabled===true }));
    const t=(main.innerText||''); const i=t.lastIndexOf('\\u203a');
    return { content:(i>=0?t.slice(i+1):t).replace(/\\s+/g,' ').trim().slice(0,260), controls: items }; })()`);
  const perms = await page.evaluate(async () => {
    const j=await (await fetch('/api/v1/companies/O4QDF1XTURESO01/members?limit=100&offset=0',{credentials:'include'})).json();
    const a=j.members||j.items||[]; const m=a.find(x=>x.user_id==='U4QDALICE000001');
    return m?(m.roles||[]).flatMap(r=>r.permissions||[]):[]; });
  // does the SERVER let this account do what the permission names?
  const api = await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01';
    const out={};
    const r1 = await fetch(`/api/v1/companies/${CO}/roles`, { credentials:'include' });
    out.listRoles = { s:r1.status, body:(await r1.text()).slice(0,90) };
    const r2 = await fetch(`/api/v1/companies/${CO}/roles`, { method:'POST', credentials:'include',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ name:'D2 rolemanage probe', permissions:[`company.${CO}.member.view`] }) });
    const t2 = await r2.text(); out.createRole = { s:r2.status, body:t2.slice(0,140) };
    let id=null; try{ id=JSON.parse(t2).id; }catch{}
    if (id) { const r3=await fetch(`/api/v1/companies/roles/${id}`,{method:'DELETE',credentials:'include'});
              out.cleanupDelete = r3.status; }
    return out;
  });
  return { effectivePermissions: perms, rolesPageUI: ui, serverSide: api };
};
