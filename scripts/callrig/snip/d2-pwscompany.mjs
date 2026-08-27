export default async ({ page }) => {
  const PWS='W4OWMGU872O1OZJ'; const out={};
  for (const p of ['company','roles?scope=company','admin/company']) {
    await page.goto(`https://airion-cargo.store/w/${PWS}/settings/${p}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3400);
    out[p] = await page.evaluate(() => {
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const main=document.querySelector('main');
      const t=(main?.innerText||'').replace(/\s+/g,' ');
      const i=t.indexOf('Settings ›');
      const inter=[...main.querySelectorAll('button,input')].filter(vis).filter(e=>!e.closest('nav,aside'))
        .map(e=>(e.getAttribute('aria-label')||e.innerText||e.value||'').trim().replace(/\s+/g,' ').slice(0,30));
      return { head:(i>=0?t.slice(i):t).slice(0,180), controls:inter.slice(0,6),
        mentionsFixtures:/QA Fixtures D/.test(t) };
    });
  }
  return out;
};
