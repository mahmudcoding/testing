export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/invites`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  return await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main');
    const inter=[...main.querySelectorAll('button,input,select,[role=switch],[role=combobox],[role=checkbox]')]
      .filter(vis).filter(e=>!e.closest('nav,aside'))
      .map(e=>({tag:e.tagName.toLowerCase(), role:e.getAttribute('role')||'', type:e.type||'',
                l:(e.getAttribute('aria-label')||e.innerText||e.placeholder||'').trim().replace(/\s+/g,' ').slice(0,40),
                off:e.disabled===true}));
    const t=(main.innerText||'').replace(/\s+/g,' ');
    const i=t.indexOf('Settings ›');
    return { controls:inter, text:(i>=0?t.slice(i):t).slice(0,400) };
  });
};
