export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/privacy`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  return await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main')||document.body;
    const all=(main.innerText||'').replace(/\s+/g,' ');
    const i=all.indexOf('Settings ›');
    const c=(i>=0?all.slice(i):all);
    const heads=[...main.querySelectorAll('h1,h2,h3,h4')].filter(vis).map(h=>(h.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean);
    const ctl=[...main.querySelectorAll('button,input,select,[role=switch],[role=combobox]')].filter(vis)
      .map(e=>({t:e.tagName.toLowerCase(), r:e.getAttribute('role')||'', l:(e.getAttribute('aria-label')||e.innerText||e.placeholder||'').trim().replace(/\s+/g,' ').slice(0,44)}));
    return { text:c.slice(0,900), headings:heads, controls:ctl,
      mentionsDM: /direct message|who can message|DM|invitation|invite you/i.test(c) };
  });
};
