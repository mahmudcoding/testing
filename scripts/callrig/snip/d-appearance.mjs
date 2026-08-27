export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const res={reqs:[]};
  page.on('request', r=>{ if(r.url().includes('/api/v1/')&&r.method()!=='GET') res.reqs.push(r.method()+' '+r.url().replace('https://airion-cargo.store','').slice(0,60)+' '+(r.postData()||'').slice(0,80)); });
  const state = () => page.evaluate(()=>({
    theme: document.documentElement.getAttribute('data-theme')||document.documentElement.className.slice(0,40),
    pressed: [...document.querySelectorAll('main button')].filter(b=>b.getBoundingClientRect().width>0)
      .map(b=>({l:(b.innerText||'').trim().slice(0,14), on:b.getAttribute('aria-pressed')||b.getAttribute('data-state')||''}))
      .filter(x=>x.on==='true'||x.on==='on'||x.on==='active')
  }));
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/appearance`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  res.before = await state();
  // pick a non-default accent
  const accent = page.locator('main button', {hasText:/^Teal$/}).first();
  if (await accent.count()) { await accent.click(); await page.waitForTimeout(1500); }
  res.dirtyButtons = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0).map(b=>(b.innerText||'').trim().slice(0,22)).filter(l=>/save|discard|сохран/i.test(l)));
  const save = page.locator('button').filter({hasText:/Save|Сохранить/i}).first();
  if (await save.count()) { await save.click(); await page.waitForTimeout(3000); }
  res.reqsAfterSave = [...res.reqs];
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  res.afterReload = await state();
  // restore Indigo
  const back = page.locator('main button', {hasText:/^Indigo$/}).first();
  if (await back.count()) {
    await back.click(); await page.waitForTimeout(1500);
    const s2 = page.locator('button').filter({hasText:/Save|Сохранить/i}).first();
    if (await s2.count()) { await s2.click(); await page.waitForTimeout(3000); }
  }
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(4000);
  res.restored = await state();
  return res;
};
