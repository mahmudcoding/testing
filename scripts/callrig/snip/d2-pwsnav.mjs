export default async ({ page }) => {
  const PWS='W4OWMGU872O1OZJ';
  await page.goto(`https://airion-cargo.store/w/${PWS}/settings/account`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4200);
  const out = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const links=[...document.querySelectorAll('a[href*="/settings/"]')].filter(vis)
      .map(a=>({t:(a.innerText||'').trim().replace(/\s+/g,' ').slice(0,26), h:a.getAttribute('href').split('/settings/')[1]}));
    return { all:links, adminEntries:links.filter(l=>l.h.startsWith('admin/')),
      hasCompany:links.some(l=>l.h==='company'),
      hasCompanyRoles:links.some(l=>l.h.startsWith('roles?scope=company')) };
  });
  return out;
};
