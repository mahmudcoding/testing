export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(12000);
  const out={};
  const bodies=[];
  const onReq=(r)=>{const u=r.url();
    if(u.includes('/api/v1/channels')&&['POST','PATCH'].includes(r.method())){
      try{ bodies.push(r.method()+' '+u.split('/api/v1')[1].slice(0,26)+' :: '+String(r.postData()||'').slice(0,110)); }catch(e){} }};
  page.on('request',onReq);
  // 1. create through the UI dialog
  await page.locator('button[aria-label="Add channel"]').first().click({timeout:6000}).catch(()=>{out.addFail=true});
  await page.waitForTimeout(3500);
  const nameIn=page.locator('[role="dialog"] input').first();
  out.dialogInputs=await page.locator('[role="dialog"] input').count();
  if(out.dialogInputs){
    await nameIn.fill('   QA C2 Slug Probe   ');
    await page.waitForTimeout(1000);
    out.fieldShows=await nameIn.inputValue();
    const create=page.locator('[role="dialog"] button').filter({hasText:/^(Create|Create channel)$/}).first();
    if(await create.count()) await create.click({timeout:6000}).catch(()=>{out.createFail=true});
    await page.waitForTimeout(8000);
  }
  out.afterCreate=await page.evaluate(()=>location.pathname.slice(-20));
  // 2. rename through Channel details
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(3500);
  const field=page.locator('input:visible').first();
  if(await field.count()){
    await field.fill('QA C2 Renamed Probe');
    await page.waitForTimeout(900);
    const save=page.locator('button').filter({hasText:/^Save$/}).first();
    if(await save.count()) await save.click({timeout:6000}).catch(()=>{out.saveFail=true});
    await page.waitForTimeout(7000);
  }
  page.off('request',onReq);
  out.requests=bodies.slice(0,4);
  return out;
};
