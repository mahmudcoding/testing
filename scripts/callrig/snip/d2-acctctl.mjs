export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4200);
  return await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main');
    const t=(main?.innerText||'').replace(/\s+/g,' ');
    const i=t.search(/Language|Язык/i);
    return { langRegion: i>=0? t.slice(Math.max(0,i-40), i+140):'(no Language text)',
      controls: [...main.querySelectorAll('button,select,input,[role=combobox],[role=switch]')].filter(vis)
        .filter(e=>!e.closest('nav,aside'))
        .map(e=>({tag:e.tagName.toLowerCase(), role:e.getAttribute('role')||'',
                  l:(e.getAttribute('aria-label')||e.innerText||e.value||'').trim().replace(/\s+/g,' ').slice(0,32)})) };
  });
};
