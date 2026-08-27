export default async ({page}) => {
  const out={}; const ws='W4QDF1XTURESO01'; const co='O4QDF1XTURESO01';
  const NAME='QA verify probe D';

  await page.goto(`https://airion-cargo.store/w/${ws}/settings/roles?scope=company`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  out.rolesBeforeDelete = await page.evaluate(async()=>{
    const r=await fetch(`/api/v1/companies/O4QDF1XTURESO01/roles`,{credentials:'include'});
    const j=await r.json(); const a=Array.isArray(j)?j:(j.roles||j.items||[]);
    return a.map(x=>`${x.name} ${x.id}`);
  });

  // delete the probe role row via its Delete button
  const row = page.locator('main tr', {hasText: NAME}).first();
  out.rowFound = await row.count();
  if (out.rowFound) {
    await row.locator('button', {hasText:/^Delete$/}).first().click().catch(e=>out.delErr=String(e).slice(0,90));
    await page.waitForTimeout(1200);
    out.confirmText = await page.evaluate(()=>{const d=document.querySelector('[role=dialog],[role=alertdialog]');return d?(d.innerText||'').slice(0,220):null;});
    // confirm
    const dlg = page.locator('[role=dialog],[role=alertdialog]');
    if (await dlg.count()) {
      await dlg.locator('button', {hasText:/Delete|Confirm|Remove/i}).last().click().catch(e=>out.confErr=String(e).slice(0,90));
    }
    await page.waitForTimeout(2500);
  }
  out.rolesAfterDelete = await page.evaluate(async()=>{
    const r=await fetch(`/api/v1/companies/O4QDF1XTURESO01/roles`,{credentials:'include'});
    const j=await r.json(); const a=Array.isArray(j)?j:(j.roles||j.items||[]);
    return a.map(x=>`${x.name} ${x.id}`);
  });

  // now the audit log page, cold load
  const seen=[];
  page.on('response', r=>{const u=r.url(); if(u.includes('audit-log')&&u.includes('/api/')) seen.push({url:u.replace(/^https:\/\/[^/]+/,''),s:r.status()});});
  await page.goto(`https://airion-cargo.store/w/${ws}/settings/admin/audit-log`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  out.pageRequests=seen;

  out.screen = await page.evaluate(()=>{
    const rows=[...document.querySelectorAll('table tr')].filter(tr=>tr.offsetParent!==null);
    return {rowCount:rows.length,
      actions: rows.slice(1).map(tr=>((tr.querySelector('td')||{}).innerText||'').trim()),
      empty:/No audit entries found/i.test((document.querySelector('main')||document.body).innerText)};
  });
  out.api = await page.evaluate(async({ws,co})=>{
    const get=async u=>{const r=await fetch(u,{credentials:'include'});let j=null;try{j=await r.json()}catch(e){}
      const a=Array.isArray(j)?j:(j?.entries||j?.items||[]);
      return {s:r.status,count:Array.isArray(a)?a.length:null,ev:(Array.isArray(a)?a:[]).map(e=>`${e.action||e.event}[${e.scope_type||e.scopeType}]`)};};
    return {workspace:await get(`/api/v1/workspaces/${ws}/admin/audit-log?limit=100`),
            company:await get(`/api/v1/companies/${co}/admin/audit-log?limit=100`)};
  },{ws,co});
  return out;
}
