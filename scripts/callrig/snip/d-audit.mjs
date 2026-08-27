export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const log=[];
  // 1. rename the workspace (an administrative action)
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/workspace`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const inp = page.locator('main input').filter({hasNot: page.locator('[aria-label="Filter settings"]')}).last();
  await inp.fill('QA Workspace D renamed');
  await page.waitForTimeout(900);
  const afterType = await page.evaluate(()=>{const b=[];document.querySelectorAll('main button').forEach(x=>{const r=x.getBoundingClientRect();if(r.width>0&&r.height>0)b.push({l:((x.innerText||'').trim()||x.getAttribute('aria-label')||'?').slice(0,28),dis:x.disabled});});return b;});
  log.push({step:'after typing new name', buttons:afterType});
  const save = page.locator('main button', {hasText:/^Save/i}).first();
  let saved=null;
  if (await save.count()) {
    const [resp] = await Promise.all([
      page.waitForResponse(r=>r.url().includes('/api/v1/') && r.request().method()!=='GET', {timeout:12000}).catch(()=>null),
      save.click()
    ]);
    await page.waitForTimeout(2500);
    saved = resp ? {status:resp.status(), method:resp.request().method(), url:resp.url().replace('https://airion-cargo.store','')} : 'no non-GET request seen';
  } else saved='no Save button';
  log.push({step:'save', saved});
  // 2. read the audit log
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/audit-log`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const audit = await page.evaluate(()=>{const m=document.querySelector('main');return (m.innerText||'').replace(/\s+/g,' ').slice(230,900);});
  const auditApi = await page.evaluate(async()=>{
    const tries=['/api/v1/companies/O4QDF1XTURESO01/audit-log?limit=20','/api/v1/audit-log?limit=20','/api/v1/company/O4QDF1XTURESO01/audit-log?limit=20'];
    const out=[];
    for(const u of tries){ try{const r=await fetch(u,{credentials:'include'}); const t=await r.text(); out.push({u, s:r.status, b:t.slice(0,220)});}catch(e){out.push({u,e:String(e).slice(0,60)});} }
    return out;
  });
  log.push({step:'audit after rename', pageText:audit, api:auditApi});
  // 3. rename back
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/workspace`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const inp2 = page.locator('main input').last();
  await inp2.fill('QA Workspace D');
  await page.waitForTimeout(800);
  const s2 = page.locator('main button', {hasText:/^Save/i}).first();
  if (await s2.count()) { await s2.click(); await page.waitForTimeout(2500); }
  const finalName = await page.evaluate(()=>document.querySelector('main input:not([aria-label="Filter settings"])')?.value);
  log.push({step:'restored', finalName});
  return log;
};
