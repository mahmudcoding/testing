export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  const pages=[['admin/workspaces','Every workspace in this company'],['admin/company','recent activity'],
               ['about','licences'],['security','encryption keys']];
  for (const [p,promise] of pages) {
    await page.goto(`https://airion-cargo.store/w/${WS}/settings/${p}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3500);
    out[p] = await page.evaluate(() => {
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const main=document.querySelector('main');
      const all=(main.innerText||'').replace(/\s+/g,' ');
      const i=all.indexOf('Settings ›');
      const c=(i>=0?all.slice(i):all);
      const links=[...main.querySelectorAll('a')].filter(vis).filter(e=>!e.closest('nav,aside')).length;
      return { head:c.slice(0,170), contentLinks:links,
        controls:[...main.querySelectorAll('button,input')].filter(vis).filter(e=>!e.closest('nav,aside')).length };
    });
    out[p].promised = promise;
  }
  return out;
};
