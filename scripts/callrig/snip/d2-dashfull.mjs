export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/company',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  return await page.evaluate(async ()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>2&&r.height>2;};
    const m=document.querySelector('main');
    const t=(m.innerText||'').replace(/\s+/g,' ');
    const i=t.indexOf('Company dashboard');
    // truth from the API
    const co=await (await fetch('/api/v1/companies/O4QDF1XTURESO01/members?limit=100&offset=0',{credentials:'include'})).json().catch(()=>({}));
    const ws=await (await fetch('/api/v1/companies/O4QDF1XTURESO01/workspaces',{credentials:'include'})).json().catch(()=>({}));
    const audit=await (await fetch('/api/v1/companies/O4QDF1XTURESO01/admin/audit-log?limit=5',{credentials:'include'})).json().catch(()=>({}));
    return {
      overviewText: t.slice(i, i+700),
      sectionHeadings:[...m.querySelectorAll('h2,h3,h4')].filter(vis).map(h=>h.innerText.trim().slice(0,40)),
      mentionsActivity: /recent activity|activity/i.test(t),
      apiMembers:(co.members||co||[]).length,
      apiWorkspaces:(ws.workspaces||ws||[]).length,
      apiAuditRecent:(audit.entries||[]).slice(0,3).map(e=>e.action)
    };
  });
};
