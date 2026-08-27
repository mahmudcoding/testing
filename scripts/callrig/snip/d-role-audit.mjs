export default async ({page}) => {
  const WS='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
  const res={};
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/roles?scope=company`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  // fill the role name and create
  const name = page.locator('main input').filter({hasNotText:'x'}).nth(1);
  const inputs = await page.evaluate(()=>{const o=[];document.querySelectorAll('main input').forEach(x=>{const r=x.getBoundingClientRect();if(r.width>0&&r.height>0)o.push({ph:x.placeholder||'',al:x.getAttribute('aria-label')||'',type:x.type});});return o;});
  res.inputs = inputs;
  const roleName = page.locator('main input[type="text"]').first();
  await roleName.fill('QA temp audit probe');
  await page.waitForTimeout(600);
  const perm = page.locator('main label', {hasText:'View company members'}).first();
  if (await perm.count()) { try{ await perm.click(); }catch(e){} }
  await page.waitForTimeout(600);
  const btn = page.locator('main button', {hasText:/^Create role$/i}).last();
  const [resp] = await Promise.all([
    page.waitForResponse(r=>r.url().includes('/api/v1/')&&r.request().method()==='POST',{timeout:15000}).catch(()=>null),
    btn.click()
  ]);
  await page.waitForTimeout(3000);
  res.create = resp?{s:resp.status(), u:resp.url().replace('https://airion-cargo.store','')}:'no POST';
  res.audit = await page.evaluate(async(a)=>{
    const p=async u=>{const r=await fetch(u,{credentials:'include'});return {s:r.status,b:(await r.text()).slice(0,300)};};
    return {company:await p(`/api/v1/companies/${a.CO}/admin/audit-log?limit=100`), workspace:await p(`/api/v1/workspaces/${a.WS}/admin/audit-log?limit=100`)};
  },{WS,CO});
  // clean up: delete the probe role
  await page.waitForTimeout(500);
  const del = page.locator('main tr', {hasText:'QA temp audit probe'}).locator('button', {hasText:/Delete/i}).first();
  if (await del.count()) {
    await del.click(); await page.waitForTimeout(1500);
    const conf = page.locator('[role="dialog"] button, [role="alertdialog"] button').filter({hasText:/delete|confirm|yes/i}).last();
    if (await conf.count()) { await conf.click(); await page.waitForTimeout(2000); }
  }
  res.cleanedUp = await page.evaluate(()=> !(document.querySelector('main')?.innerText||'').includes('QA temp audit probe'));
  return res;
};
