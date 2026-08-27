export default async ({page}) => {
  const WS='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
  const res={};
  // --- A. enumerate every control on workspace settings, both tabs, for a transfer-ownership path
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/workspace`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const enumerate = () => page.evaluate(()=>{
    const m=document.querySelector('main')||document.body;
    const ctl=[];
    m.querySelectorAll('button,a,[role="button"],[role="menuitem"],select').forEach(x=>{
      const r=x.getBoundingClientRect(); if(r.width<=0||r.height<=0) return;
      ctl.push({tag:x.tagName.toLowerCase(), l:((x.innerText||'').trim()||x.getAttribute('aria-label')||'?').slice(0,34), dis:!!x.disabled||x.getAttribute('aria-disabled')==='true'});
    });
    return {controls:ctl, text:(m.innerText||'').replace(/\s+/g,' ').slice(150,900)};
  });
  res.wsGeneral = await enumerate();
  // Roles tab of the workspace page
  const rolesTab = page.locator('main').getByText('Roles', {exact:true}).first();
  if (await rolesTab.count()) { try{ await rolesTab.click(); await page.waitForTimeout(2500);}catch(e){} }
  res.wsRoles = await enumerate();
  // --- B. create an invite link, then re-read both audit endpoints
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/invites`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3800);
  let created=null;
  const btn = page.locator('main button', {hasText:/Create invite link/i}).first();
  if (await btn.count()) {
    const [resp] = await Promise.all([
      page.waitForResponse(r=>r.url().includes('/api/v1/')&&r.request().method()==='POST',{timeout:12000}).catch(()=>null),
      btn.click()
    ]);
    await page.waitForTimeout(2500);
    created = resp ? {s:resp.status(), u:resp.url().replace('https://airion-cargo.store','')} : 'no POST seen';
  } else created='no Create invite link button';
  res.inviteCreated = created;
  res.audit = await page.evaluate(async(a)=>{
    const p = async u => {const r=await fetch(u,{credentials:'include'}); return {s:r.status, b:(await r.text()).slice(0,240)};};
    return {company: await p(`/api/v1/companies/${a.CO}/admin/audit-log?limit=100`), workspace: await p(`/api/v1/workspaces/${a.WS}/admin/audit-log?limit=100`)};
  }, {WS,CO});
  return res;
};
