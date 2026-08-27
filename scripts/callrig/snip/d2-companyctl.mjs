export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/company`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  return await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main');
    const inter=[...main.querySelectorAll('button,a,[role=button],input')].filter(vis)
      .filter(e=>!e.closest('nav,aside'))
      .map(e=>({tag:e.tagName.toLowerCase(),
                l:(e.getAttribute('aria-label')||e.innerText||e.value||'').trim().replace(/\s+/g,' ').slice(0,44)}));
    const all=(main.innerText||'').replace(/\s+/g,' '); const i=all.indexOf('Settings ›');
    return { contentControls: inter, text:(i>=0?all.slice(i):all).slice(0,220) };
  });
};
