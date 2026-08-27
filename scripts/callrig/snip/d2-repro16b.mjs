export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  const get=()=>page.evaluate(async()=>{const r=await fetch('/api/v1/notifications/settings',{credentials:'include'});return (await r.text()).slice(0,200);});
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/notifications`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const els = async () => page.$$('main [role=switch]');
  // step 3a: turn ON Mute channel notifications (index 1)
  let s = await els(); await s[1].click().catch(()=>{}); await page.waitForTimeout(1000);
  // step 3b: turn OFF In-app notifications (index 0)
  s = await els(); await s[0].click().catch(()=>{}); await page.waitForTimeout(1000);
  const save = await page.$('main button:has-text("Save preferences")');
  if (save) { await save.click().catch(()=>{}); await page.waitForTimeout(3500); }
  out.serverAfter = await get();
  out.screen = await page.evaluate(()=>{
    const t=(document.body.innerText||'').replace(/\s+/g,' ');
    return { error:/cannot be turned off|Keep at least one/i.test(t),
             saved:/saved|updated/i.test(t) };
  });
  // restore defaults
  await page.evaluate(async()=>{await fetch('/api/v1/notifications/settings',{method:'PATCH',credentials:'include',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({in_app_enabled:true, mute_all_channels:false})});});
  await page.waitForTimeout(1500);
  out.restored = await get();
  return out;
};
