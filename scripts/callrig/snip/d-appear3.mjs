export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const res={reqs:[]};
  page.on('request', r=>{ if(r.url().includes('/api/v1/')&&r.method()!=='GET') res.reqs.push(r.method()+' '+r.url().replace('https://airion-cargo.store','').slice(0,55)+' '+(r.postData()||'').slice(0,60)); });
  const themeState = () => page.evaluate(()=>{
    const o={}; document.querySelectorAll('main button[aria-pressed]').forEach(b=>{const t=(b.innerText||'').trim(); if(/^(Light|Dark|System|Compact|Cozy|Comfortable|Standard|Left|Right)$/.test(t)) o[t]=b.getAttribute('aria-pressed');});
    return {pressed:o, docTheme:document.documentElement.getAttribute('data-theme')||'(none)'};
  });
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/appearance`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  res.before = await themeState();
  // click Dark — this time assert the click actually happened
  const dark = page.locator('main button[aria-pressed]').filter({hasText:/^Dark$/}).first();
  res.darkFound = await dark.count();
  if (res.darkFound) {
    await dark.click();
    await page.waitForTimeout(2000);
    res.afterClick = await themeState();
    res.saveVisible = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0).map(b=>(b.innerText||'').trim()).filter(l=>/save|discard/i.test(l)));
    const save = page.locator('button').filter({hasText:/Save/i}).first();
    if (await save.count()) { await save.click(); await page.waitForTimeout(2500); }
    res.reqs1=[...res.reqs];
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4500);
    res.afterReload = await themeState();
    // restore System
    const sys = page.locator('main button[aria-pressed]').filter({hasText:/^System$/}).first();
    if (await sys.count()) { await sys.click(); await page.waitForTimeout(1800);
      const s2=page.locator('button').filter({hasText:/Save/i}).first();
      if (await s2.count()) { await s2.click(); await page.waitForTimeout(2500); } }
    await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(4000);
    res.restored = await themeState();
  }
  return res;
};
