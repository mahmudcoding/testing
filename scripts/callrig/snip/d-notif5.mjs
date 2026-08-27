export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const res={calls:[]};
  page.on('request', async r=>{
    if(r.url().includes('/notifications/settings') && r.method()!=='GET'){
      res.calls.push({m:r.method(), body:(r.postData()||'').slice(0,200)});
    }
  });
  page.on('response', async r=>{
    if(r.url().includes('/notifications/settings') && r.request().method()!=='GET'){
      try{ res.calls.push({resp:r.status(), body:(await r.text()).slice(0,200)}); }catch(e){}
    }
  });
  const api = () => page.evaluate(async()=> (await (await fetch('/api/v1/notifications/settings',{credentials:'include'})).json()));
  const sw = () => page.evaluate(()=>{const o=[];document.querySelectorAll('main [role="switch"],main button[aria-pressed],main button[data-state]').forEach(x=>{const r=x.getBoundingClientRect();if(r.width>0&&r.height>0)o.push(x.getAttribute('aria-checked')||x.getAttribute('aria-pressed')||x.getAttribute('data-state')||'?');});return o;});

  await page.goto(`https://airion-cargo.store/w/${WS}/settings/notifications`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  res.apiBefore = await api();
  res.uiBefore  = await sw();

  // toggle the SECOND switch (mute_all_channels) — unambiguous, starts false
  await page.locator('main [role="switch"], main button[aria-pressed], main button[data-state]').nth(1).click();
  await page.waitForTimeout(1500);
  res.uiAfterToggle = await sw();
  await page.locator('button').filter({hasText:/Save preferences/i}).first().click();
  await page.waitForTimeout(4000);
  res.apiAfterSave = await api();
  res.uiAfterSave  = await sw();

  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  res.apiAfterReload = await api();
  res.uiAfterReload  = await sw();
  return res;
};
