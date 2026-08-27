export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/security`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const res={};
  res.stateOnLoad = await page.evaluate(()=>{const m=document.querySelector('main');const t=(m.innerText||'').replace(/\s+/g,' ');const i=t.indexOf('Two-factor');return t.slice(i,i+230);});
  const c = page.locator('main button', {hasText:/^Cancel$/i}).first();
  if (await c.count()) {
    const [resp]=await Promise.all([
      page.waitForResponse(r=>r.url().includes('/api/v1/')&&r.request().method()!=='GET',{timeout:10000}).catch(()=>null),
      c.click()
    ]);
    await page.waitForTimeout(2500);
    res.cancel = resp?{s:resp.status(), m:resp.request().method(), u:resp.url().replace('https://airion-cargo.store','')}:'no non-GET request';
  } else res.cancel='no Cancel button present on load';
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  res.afterReload = await page.evaluate(()=>{const m=document.querySelector('main');const t=(m.innerText||'').replace(/\s+/g,' ');const i=t.indexOf('Two-factor');const btns=[];m.querySelectorAll('button').forEach(x=>{const r=x.getBoundingClientRect();if(r.width>0&&r.height>0)btns.push(((x.innerText||'').trim()||'?').slice(0,24));});return {text:t.slice(i,i+220), btns};});
  return res;
};
