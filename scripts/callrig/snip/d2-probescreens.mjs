export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(800); await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(3200);
  for (const p of ['roles?scope=company','roles?scope=workspace','admin/members','admin/invites','admin/workspaces','admin/audit-log']) {
    await page.goto(`https://airion-cargo.store/w/${WS}/settings/${p}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(2800);
    out[p] = await page.evaluate(() => {
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const main=document.querySelector('main');
      const t=(main.innerText||'').replace(/\s+/g,' ');
      const refusal=/cannot view|do not have permission|access required/i.test(t);
      const inter=[...main.querySelectorAll('button,input,select')].filter(vis).filter(e=>!e.closest('nav,aside'));
      return { refusal, n:inter.length, enabled:inter.filter(e=>e.disabled!==true).length };
    });
  }
  out.nav = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return [...document.querySelectorAll('a[href*="/settings/admin/"]')].filter(vis)
      .map(a=>a.getAttribute('href').split('/settings/')[1]);
  });
  return out;
};
