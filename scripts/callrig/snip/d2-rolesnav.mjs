export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  const out = {};
  out.email = await page.evaluate(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});return (await r.json()).email;});
  out.navAll = await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return [...document.querySelectorAll('a[href*="/settings/"]')].filter(vis)
      .map(a=>({t:(a.innerText||'').trim().replace(/\s+/g,' ').slice(0,30), h:a.getAttribute('href').split('/settings/')[1], side:a.closest('nav,aside')?'nav':'body'}));
  });
  const rolesLink = await page.$('a[href*="roles?scope=company"]');
  out.rolesLinkPresent = !!rolesLink;
  if (rolesLink) {
    await rolesLink.click().catch(()=>{});
    await page.waitForTimeout(3000);
  }
  out.after = await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main = document.querySelector('main') || document.body;
    const txt = (main.innerText||'').replace(/\s+/g,' ');
    return { url: location.pathname+location.search,
      mainText: txt.slice(0,300),
      mainButtons: [...main.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,36)).filter(Boolean).slice(0,20),
      rowCount: main.querySelectorAll('[role=row],tbody tr,li').length };
  });
  out.api = await page.evaluate(async()=>{const r=await fetch('/api/v1/companies/O4QDF1XTURESO01/roles',{credentials:'include'});return {s:r.status, t:(await r.text()).slice(0,220)};});
  return out;
};
