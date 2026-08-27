export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const res={reqs:[]};
  page.on('request', r=>{ if(r.url().includes('/api/v1/') && r.method()!=='GET') res.reqs.push(r.method()+' '+r.url().replace('https://airion-cargo.store','').slice(0,80)); });
  const read = async () => page.evaluate(()=>{const o=[];document.querySelectorAll('main [role="switch"],main button[aria-pressed],main button[data-state]').forEach((x,i)=>{const r=x.getBoundingClientRect();if(r.width>0&&r.height>0)o.push(x.getAttribute('aria-checked')||x.getAttribute('aria-pressed')||x.getAttribute('data-state')||'?');});return o;});
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/notifications`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  res.before = await read();
  const t = page.locator('main [role="switch"], main button[aria-pressed], main button[data-state]');
  // toggle EACH switch in turn, generous settle time after each
  for (let i=0;i<await t.count();i++){
    await t.nth(i).click();
    await page.waitForTimeout(4000);
  }
  res.afterAllClicks = await read();
  await page.waitForTimeout(6000);          // generous settle for any debounced save
  res.reqsAfterSettle = [...res.reqs];
  res.stateBeforeReload = await read();
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  res.afterReload = await read();
  // is there a Save button anywhere that I might have missed?
  res.buttons = await page.evaluate(()=>{const b=[];document.querySelectorAll('main button').forEach(x=>{const r=x.getBoundingClientRect();if(r.width>0&&r.height>0)b.push(((x.innerText||'').trim()||x.getAttribute('aria-label')||'?').slice(0,30));});return b;});
  return res;
};
