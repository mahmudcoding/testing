export default async ({page}) => {
  const WS='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
  // make sure at least one company-scope event exists again
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/roles?scope=company`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.locator('main input[type="text"]').first().fill('QA filter probe');
  await page.waitForTimeout(500);
  const p = page.locator('main label', {hasText:'View company members'}).first();
  if (await p.count()) { try{await p.click();}catch(e){} }
  await page.waitForTimeout(400);
  await page.locator('main button', {hasText:/^Create role$/i}).last().click();
  await page.waitForTimeout(3000);

  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/audit-log`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const ui = await page.evaluate(()=>{
    const m=document.querySelector('main');
    const ctl=[];
    m.querySelectorAll('button,select,input,[role="combobox"],[role="tab"]').forEach(x=>{
      const r=x.getBoundingClientRect(); if(r.width<=0||r.height<=0) return;
      ctl.push({tag:x.tagName.toLowerCase(), l:((x.innerText||'').trim()||x.getAttribute('aria-label')||x.placeholder||'?').slice(0,32)});
    });
    const rows=[]; m.querySelectorAll('tr').forEach(tr=>{const t=(tr.innerText||'').replace(/\s+/g,' ').trim(); if(t) rows.push(t.split(' ')[0]);});
    return {controls:ctl, rowActions:rows};
  });
  const api = await page.evaluate(async(a)=>{
    const p=async u=>{const r=await fetch(u,{credentials:'include'});const t=await r.text();let n=0;try{const j=JSON.parse(t);n=Array.isArray(j)?j.length:(j.entries||[]).length;}catch(e){}return {s:r.status,n};};
    return {
      wsPlain: await p(`/api/v1/workspaces/${a.WS}/admin/audit-log?limit=100`),
      coPlain: await p(`/api/v1/companies/${a.CO}/admin/audit-log?limit=100`),
      coScopeCompany: await p(`/api/v1/companies/${a.CO}/admin/audit-log?limit=100&scope_type=company`),
      wsScopeCompany: await p(`/api/v1/workspaces/${a.WS}/admin/audit-log?limit=100&scope_type=company`),
    };
  },{WS,CO});
  // cleanup
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/roles?scope=company`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const del = page.locator('main tr', {hasText:'QA filter probe'}).locator('button', {hasText:/Delete/i}).first();
  if (await del.count()) { await del.click(); await page.waitForTimeout(1500);
    const c=page.locator('[role="dialog"] button, [role="alertdialog"] button').filter({hasText:/delete|confirm|yes/i}).last();
    if(await c.count()){await c.click(); await page.waitForTimeout(2000);} }
  const cleaned = await page.evaluate(()=> !(document.querySelector('main')?.innerText||'').includes('QA filter probe'));
  return {ui, api, cleaned};
};
