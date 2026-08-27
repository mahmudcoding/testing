export default async ({page}) => {
  const WS='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/audit-log`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const rendered = await page.evaluate(()=>{
    const rows=[];
    document.querySelectorAll('main tr').forEach(tr=>{const t=(tr.innerText||'').replace(/\s+/g,' ').trim(); if(t) rows.push(t.slice(0,90));});
    return rows;
  });
  const api = await page.evaluate(async(a)=>{
    const co = await (await fetch(`/api/v1/companies/${a.CO}/admin/audit-log?limit=100`,{credentials:'include'})).json();
    const ws = await (await fetch(`/api/v1/workspaces/${a.WS}/admin/audit-log?limit=100`,{credentials:'include'})).json();
    const cA=(co.entries||[]).map(e=>e.action+' ['+e.scope_type+']');
    const wA=(Array.isArray(ws)?ws:[]).map(e=>e.action+' ['+(e.scope_type||'?')+']');
    return {company:cA, workspace:wA};
  },{WS,CO});
  const missing = api.company.filter(a=>!api.workspace.includes(a));
  return {renderedRowCount:rendered.length, rendered, api, inCompanyButNotWorkspace:missing};
};
