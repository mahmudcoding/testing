export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  return await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main');
    const all=(main.innerText||'').replace(/\s+/g,' ');
    const i=all.search(/Danger zone/i);
    const zone=i>=0? all.slice(i, i+320):'(no Danger zone text)';
    const dz=[...main.querySelectorAll('button')].filter(vis).filter(e=>!e.closest('nav,aside'))
      .filter(b=>/deactivate|delete/i.test((b.getAttribute('aria-label')||b.innerText||'')))
      .map(b=>({label:(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,40),
                disabled: b.disabled===true, ariaDisabled: b.getAttribute('aria-disabled'),
                pointerEvents: getComputedStyle(b).pointerEvents}));
    return { zoneText: zone, destructiveButtons: dz };
  });
};
