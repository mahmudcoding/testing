export default async ({page}) => {
  const WS='W4QDF1XTURESO01', CO='O4QDF1XTURESO01', U='U4QDOUTSIDER001';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/members`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  const res = await page.evaluate(async(a)=>{
    const r = await fetch('/api/v1/workspaces/kick', {method:'POST', credentials:'include',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({workspace_id:a.WS, user_id:a.U})});
    const t = await r.text();
    const mem = await fetch(`/api/v1/workspaces/${a.WS}/members`,{credentials:'include'}).then(x=>x.json()).catch(()=>null);
    const arr = Array.isArray(mem)?mem:(mem?.members||mem?.data||[]);
    const audit = await fetch(`/api/v1/companies/${a.CO}/admin/audit-log?limit=100`,{credentials:'include'}).then(x=>x.json()).catch(()=>null);
    const wsAudit = await fetch(`/api/v1/workspaces/${a.WS}/admin/audit-log?limit=100`,{credentials:'include'}).then(x=>x.json()).catch(()=>null);
    return {kick:{s:r.status, b:t.slice(0,200)},
            membersNow: arr.map(m=>m.username||m.user?.username).filter(Boolean),
            companyAuditActions: (audit?.entries||[]).map(e=>e.action),
            workspaceAuditCount: Array.isArray(wsAudit)?wsAudit.length:'n/a'};
  }, {WS,CO,U});
  // now reload the audit log PAGE and see what it renders
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/audit-log`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  res.auditPageShows = await page.evaluate(()=>{const m=document.querySelector('main');return (m.innerText||'').replace(/\s+/g,' ').slice(230,600);});
  return res;
};
