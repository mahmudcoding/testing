export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/workspace`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(1200);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  return await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main')||document.body;
    const all=(main.innerText||'').replace(/\s+/g,' ');
    const i=all.indexOf('Settings ›');
    return { content:(i>=0?all.slice(i):all).slice(0,260),
      buttons:[...main.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean),
      inputs:[...main.querySelectorAll('input,textarea')].filter(vis).map(x=>({n:x.name||x.id||x.getAttribute('aria-label')||'',ro:x.readOnly,dis:x.disabled,v:(x.value||'').slice(0,24)})) };
  });
};
