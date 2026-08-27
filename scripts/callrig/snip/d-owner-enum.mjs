export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const res={};
  const enumerate = () => page.evaluate(()=>{
    const m=document.querySelector('main')||document.body;
    const ctl=[];
    m.querySelectorAll('button,a,[role="button"],[role="menuitem"],select').forEach(x=>{
      const r=x.getBoundingClientRect(); if(r.width<=0||r.height<=0) return;
      ctl.push({l:((x.innerText||'').trim()||x.getAttribute('aria-label')||'?').slice(0,34), dis:!!x.disabled||x.getAttribute('aria-disabled')==='true'});
    });
    return {n:ctl.length, controls:ctl, text:(m.innerText||'').replace(/\s+/g,' ').slice(150,950)};
  });
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/workspace`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3800);
  res.wsGeneral = await enumerate();
  const rolesTab = page.locator('main').getByText('Roles',{exact:true}).first();
  if (await rolesTab.count()) { try{ await rolesTab.click(); await page.waitForTimeout(2500);}catch(e){res.tabErr=String(e).slice(0,80);} }
  res.wsRoles = await enumerate();
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/workspaces`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  res.adminWorkspaces = await enumerate();
  return res;
};
