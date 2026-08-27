const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const which = process.env.D2_WHICH;  // invites | audit | roles
  const paths = { invites:`/w/${W}/settings/admin/invites`,
                  audit:`/w/${W}/settings/admin/audit-log`,
                  roles:`/w/${W}/settings/roles?scope=company` };
  await page.goto('https://airion-cargo.store'+paths[which], { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const ui = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const nav=[...document.querySelectorAll('a[href*="/settings/"]')].filter(vis).map(a=>(a.innerText||'').trim());
    const t=(main.innerText||'').replace(/\\s+/g,' '); const i=t.lastIndexOf('›');
    const body=(i>=0?t.slice(i+1):t).trim();
    const ctl=[...main.querySelectorAll('button,input,select,textarea,[role=switch],[role=combobox],[role=radio]')]
      .filter(vis).filter(e=>e.getBoundingClientRect().left>300)
      .filter(e=>(e.getAttribute('placeholder')||'')!=='Filter settings')
      .map(e=>({t:((e.innerText||'').trim()||e.getAttribute('aria-label')||e.getAttribute('placeholder')||'').slice(0,34),
                dis:e.disabled===true||e.getAttribute('aria-disabled')==='true'}));
    return { navHas:{Invites:nav.includes('Invites'),AuditLog:nav.includes('Audit log'),Roles:nav.includes('Roles'),
                     Members:nav.includes('Members'),Dashboard:nav.includes('Company dashboard')},
      denied:/do not have permission|Admin access required|not allowed/i.test(body),
      total:ctl.length, enabled:ctl.filter(c=>!c.dis).length,
      controls:ctl.slice(0,12), bodyHead:body.slice(0,150) }; })()`);
  const api = await page.evaluate(async () => {
    const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
    const j=async(m,u,b)=>{const r=await fetch(u,{method:m,credentials:'include',
      headers:b?{'Content-Type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      const t=await r.text(); return {s:r.status, b:t.slice(0,120)};};
    const out={};
    // correct shape: workspace id goes in the BODY, not the path (the path form answers 405)
    out.wsInvitePost = await j('POST', '/api/v1/workspaces/invites', {workspace_id:W, role_ids:[], max_uses:1});
    try { const inv=JSON.parse(out.wsInvitePost.b); if(inv && inv.id)
      out.revoked = (await j('POST', `/api/v1/workspaces/invites/${inv.id}/revoke`)).s; } catch {}
    out.coAudit      = await j('GET',  `/api/v1/companies/${CO}/admin/audit-log?limit=2`);
    out.wsAudit      = await j('GET',  `/api/v1/workspaces/${W}/admin/audit-log?limit=2`);
    return out;
  });
  return { which, ui, api };
};
