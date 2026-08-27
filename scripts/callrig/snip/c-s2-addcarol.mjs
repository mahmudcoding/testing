export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={reqs:[]};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7500);
  await page.locator('button').filter({hasText:/members/i}).first().click();
  await page.waitForTimeout(2500);
  const row=page.locator('[role="dialog"] button').filter({hasText:'QA Carol'}).first();
  out.rowFound=await row.count();
  if(!out.rowFound){ await page.keyboard.press('Escape'); return out; }
  await row.click(); await page.waitForTimeout(1200);
  const add=page.locator('[role="dialog"] button').filter({hasText:'Add selected'}).first();
  out.addDisabled=await add.evaluate(e=>e.disabled);
  const onReq=r=>{ if(r.url().includes('/api/v1/')&&r.method()!=='GET')
    out.reqs.push(r.method()+' '+r.url().split('/api/v1')[1].slice(0,46)+' '+(r.postData()||'').slice(0,60)); };
  page.on('request', onReq);
  if(!out.addDisabled){ await add.click(); await page.waitForTimeout(3500); }
  page.off('request', onReq);
  out.after=await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role="dialog"]')].find(x=>x.getBoundingClientRect().height>40);
    const h=document.querySelector('main header')||document.querySelector('header');
    return {dialog: d? (d.innerText||'').replace(/\s+/g,' ').slice(0,160):'closed',
      header:(h?h.innerText:'').replace(/\s+/g,' ').slice(0,40)};});
  await page.keyboard.press('Escape');
  return out;
};
