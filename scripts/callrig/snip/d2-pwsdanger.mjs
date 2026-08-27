export default async ({ page }) => {
  const out={};
  for (const [name,ws] of [['personal','W4OWMGU872O1OZJ'],['company','W4QDF1XTURESO01']]) {
    await page.goto(`https://airion-cargo.store/w/${ws}/settings/workspace`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3600);
    out[name] = await page.evaluate(() => {
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const main=document.querySelector('main');
      const t=(main?.innerText||'').replace(/\s+/g,' ');
      const i=t.search(/Danger zone/i);
      const ctl=[...main.querySelectorAll('button,input')].filter(vis).filter(e=>!e.closest('nav,aside'))
        .map(e=>({l:(e.getAttribute('aria-label')||e.innerText||e.value||'').trim().replace(/\s+/g,' ').slice(0,30),
                  off:e.disabled===true, tag:e.tagName.toLowerCase()}));
      return { danger: i>=0? t.slice(i,i+180):'(no Danger zone)', controls:ctl };
    });
  }
  return out;
};
