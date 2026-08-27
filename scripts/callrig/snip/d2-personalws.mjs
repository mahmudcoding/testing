export default async ({ page }) => {
  const PWS='W4OWMGU872O1OZJ'; const out={};
  await page.goto(`https://airion-cargo.store/w/${PWS}/settings/account`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4200);
  out.nav = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return [...document.querySelectorAll('a[href*="/settings/"]')].filter(vis)
      .map(a=>a.getAttribute('href').split('/settings/')[1]);
  });
  for (const p of ['workspace','roles?scope=workspace','admin/members','admin/audit-log','admin/invites']) {
    await page.goto(`https://airion-cargo.store/w/${PWS}/settings/${p}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3000);
    out[p] = await page.evaluate(() => {
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const main=document.querySelector('main');
      const t=(main?.innerText||'').replace(/\s+/g,' ');
      const i=t.indexOf('Settings ›');
      const inter=[...main.querySelectorAll('button,input,select')].filter(vis).filter(e=>!e.closest('nav,aside'));
      return { refusal:/cannot view|do not have permission|access required/i.test(t),
        n:inter.length, enabled:inter.filter(e=>e.disabled!==true).length,
        head:(i>=0?t.slice(i):t).slice(0,120) };
    });
  }
  return out;
};
