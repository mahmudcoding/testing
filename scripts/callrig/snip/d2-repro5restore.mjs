export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/privacy`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const cbs = await page.$$('main [role=combobox]');
  await cbs[1].click().catch(()=>{});
  await page.waitForTimeout(1500);
  await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const o=[...document.querySelectorAll('[role=option]')].filter(vis).find(x=>(x.innerText||'').trim()==='Everyone');
    if(o) o.click();
  });
  await page.waitForTimeout(2500);
  return await page.evaluate(async()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main');
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return { combos:[...main.querySelectorAll('[role=combobox]')].filter(vis).map(c=>(c.innerText||'').trim()),
      stored: me.settings?.online_visibility };
  });
};
