export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/privacy`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const res = await page.evaluate(()=>{
    const m=document.querySelector('main');
    const t=(m.innerText||'').replace(/\s+/g,' ');
    const btns=[]; m.querySelectorAll('button').forEach(x=>{const r=x.getBoundingClientRect(); if(r.width>0&&r.height>0) btns.push({l:((x.innerText||'').trim()||x.getAttribute('aria-label')||'?').slice(0,36), dis:!!x.disabled});});
    return {text:t.slice(150,1500), btns};
  });
  // click Request export and see what happens
  const ex = page.locator('main button', {hasText:/Request export/i}).first();
  if (await ex.count()) {
    const [resp]=await Promise.all([
      page.waitForResponse(r=>r.url().includes('/api/v1/')&&r.request().method()!=='GET',{timeout:12000}).catch(()=>null),
      ex.click()
    ]);
    await page.waitForTimeout(3000);
    res.export = {http: resp?{s:resp.status(), m:resp.request().method(), u:resp.url().replace('https://airion-cargo.store','')}:'no non-GET request',
      after: await page.evaluate(()=>{const m=document.querySelector('main');const t=(m.innerText||'').replace(/\s+/g,' ');const i=t.indexOf('export');return t.slice(Math.max(0,i-200), i+300);}),
      dialog: await page.evaluate(()=>{const d=document.querySelector('[role="dialog"],[role="alertdialog"]');return d?(d.innerText||'').replace(/\s+/g,' ').slice(0,260):null;})};
  }
  return res;
};
