export default async ({page}) => {
  const out={}; const ws='W4QDF1XTURESO01';
  // park on a neutral page first so nothing from the previous route bleeds in
  await page.goto('https://airion-cargo.store/w', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(1500);

  const all=[];
  const onReq = r => { const u=r.url(); if(u.includes('/api/v1/')) all.push(`${r.method()} ${u.replace(/^https:\/\/[^/]+/,'')}`); };
  page.on('request', onReq);

  await page.goto(`https://airion-cargo.store/w/${ws}/settings/admin/audit-log`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  page.off('request', onReq);            // stop capturing BEFORE any probe of mine

  out.allApiRequests = all;
  out.auditRequests = all.filter(s=>s.includes('audit-log'));
  out.companyAuditRequested = all.some(s=>/companies\/[^/]+\/admin\/audit-log/.test(s));
  out.workspaceAuditRequested = all.some(s=>/workspaces\/[^/]+\/admin\/audit-log/.test(s));
  out.rendered = await page.evaluate(()=>{
    const rows=[...document.querySelectorAll('table tr')].filter(tr=>tr.offsetParent!==null);
    return rows.slice(1).map(tr=>((tr.querySelector('td')||{}).innerText||'').trim());
  });
  return out;
}
