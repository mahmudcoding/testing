export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const res={reqs:[]};
  page.on('request', r=>{ if(r.url().includes('/api/v1/')&&r.method()!=='GET') res.reqs.push(r.method()+' '+r.url().replace('https://airion-cargo.store','').slice(0,55)); });
  const radios = () => page.evaluate(()=>{
    const o={}; document.querySelectorAll('main [role="radio"]').forEach(b=>{const t=(b.innerText||'').trim().slice(0,16); if(t) o[t]=b.getAttribute('aria-checked');});
    return o;
  });
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/appearance`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  res.before = await radios();
  const target = page.locator('main [role="radio"]').filter({hasText:/^Compact$/}).first();
  res.found = await target.count();
  if (res.found) {
    await target.click(); await page.waitForTimeout(2000);
    res.afterClick = await radios();
    res.savePanel = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0).map(b=>(b.innerText||'').trim()).filter(l=>/save|discard/i.test(l)));
    const save = page.locator('button').filter({hasText:/Save/i}).first();
    if (await save.count()) { await save.click(); await page.waitForTimeout(2500); }
    res.reqs1=[...res.reqs];
    await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(4500);
    res.afterReload = await radios();
    // restore whatever was checked before
    const orig = Object.entries(res.before).find(([k,v])=>v==='true');
    if (orig) { const b=page.locator('main [role="radio"]').filter({hasText:new RegExp('^'+orig[0]+'$')}).first();
      if (await b.count()) { await b.click(); await page.waitForTimeout(1800);
        const s2=page.locator('button').filter({hasText:/Save/i}).first(); if(await s2.count()){await s2.click(); await page.waitForTimeout(2500);} } }
    await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(4000);
    res.restored = await radios();
  }
  return res;
};
