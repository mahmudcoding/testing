export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const res={reqs:[]};
  page.on('request', r=>{ if(r.url().includes('/api/v1/') && r.method()!=='GET') res.reqs.push(r.method()+' '+r.url().replace('https://airion-cargo.store','').slice(0,70)); });
  const btns = () => page.evaluate(()=>{const b=[];document.querySelectorAll('button').forEach(x=>{const r=x.getBoundingClientRect();if(r.width>0&&r.height>0)b.push(((x.innerText||'').trim()||x.getAttribute('aria-label')||'?').slice(0,26));});return b.filter(l=>l!=='?');});
  const sw = () => page.evaluate(()=>{const o=[];document.querySelectorAll('main [role="switch"],main button[aria-pressed],main button[data-state]').forEach(x=>{const r=x.getBoundingClientRect();if(r.width>0&&r.height>0)o.push(x.getAttribute('aria-checked')||x.getAttribute('aria-pressed')||x.getAttribute('data-state')||'?');});return o;});
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/notifications`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  res.buttonsClean = await btns();
  res.before = await sw();
  await page.locator('main [role="switch"], main button[aria-pressed], main button[data-state]').first().click();
  await page.waitForTimeout(2000);
  res.buttonsDirty = await btns();          // <-- the check that was missed
  res.pageTextDirty = await page.evaluate(()=>{const m=document.querySelector('main');const t=(m.innerText||'').replace(/\s+/g,' ');return t.slice(-220);});
  const save = page.locator('button').filter({hasText:/Save preferences|Сохранить/i}).first();
  res.saveExists = await save.count();
  if (res.saveExists) {
    await save.click();
    await page.waitForTimeout(3500);
    res.reqsAfterSave = [...res.reqs];
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4500);
    res.afterSaveReload = await sw();
    // restore original
    await page.locator('main [role="switch"], main button[aria-pressed], main button[data-state]').first().click();
    await page.waitForTimeout(1500);
    const s2 = page.locator('button').filter({hasText:/Save preferences|Сохранить/i}).first();
    if (await s2.count()) { await s2.click(); await page.waitForTimeout(3000); }
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4000);
    res.restored = await sw();
  }
  return res;
};
