export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/notifications`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const full = await page.evaluate(()=>{
    const m=document.querySelector('main');
    return {text:(m.innerText||'').replace(/\s+/g,' ').trim(), len:(m.innerText||'').length};
  });
  // does anything persist client-side?
  const storeBefore = await page.evaluate(()=>{
    const out={};
    for(const k of Object.keys(localStorage)) if(/notif|setting|pref/i.test(k)) out[k]=(localStorage.getItem(k)||'').slice(0,120);
    return out;
  });
  await page.locator('main [role="switch"], main button[aria-pressed], main button[data-state]').first().click();
  await page.waitForTimeout(3500);
  const storeAfter = await page.evaluate(()=>{
    const out={};
    for(const k of Object.keys(localStorage)) if(/notif|setting|pref/i.test(k)) out[k]=(localStorage.getItem(k)||'').slice(0,120);
    return out;
  });
  // restore
  await page.locator('main [role="switch"], main button[aria-pressed], main button[data-state]').first().click();
  await page.waitForTimeout(2000);
  // compare with the API's own notification settings, if any
  const api = await page.evaluate(async()=>{
    const out=[];
    for (const u of ['/api/v1/users/me/settings','/api/v1/users/me/notification-settings','/api/v1/notifications/settings','/api/v1/users/me']) {
      try{const r=await fetch(u,{credentials:'include'});const t=await r.text();out.push({u,s:r.status,b:t.slice(0,160)});}catch(e){}
    }
    return out;
  });
  return {full, storeBefore, storeAfter, api};
};
