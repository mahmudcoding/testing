export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OWNFC5WK5M1D6';   // throwaway channel
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(6500);
  const det=page.locator('button[aria-label="Channel details"], button[aria-label="Open channel details"]');
  if(await det.count()){ await det.first().click(); await page.waitForTimeout(1400); }
  const about=page.locator('[role="tab"]').filter({hasText:'About'});
  if(await about.count()){ await about.first().click(); await page.waitForTimeout(1100); }
  const inp=page.locator('input:visible').first();
  const before=await inp.evaluate(e=>e.value);
  out.nameBefore=before;
  const bad='QA C2 Rename? Two/Slash';
  await inp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.waitForTimeout(300);
  await inp.fill(bad); await page.waitForTimeout(400);
  const reqs=[];
  const onReq=r=>{ if(r.method()==='PATCH') reqs.push((r.postData()||'').slice(0,110)); };
  page.on('request', onReq);
  await page.locator('button').filter({hasText:'Save'}).first().click();
  await page.waitForTimeout(3000);
  page.off('request', onReq);
  out.patch=reqs;
  out.stored=await page.evaluate(async(ch)=>{
    const j=await (await fetch(`/api/v1/channels/${ch}`,{credentials:'include'})).json();
    return j.name;}, ch);
  out.header=await page.evaluate(()=>{
    const h=document.querySelector('main header')||document.querySelector('header');
    return h? (h.innerText||'').replace(/\s+/g,' ').slice(0,50):null;});
  // create-form control: does it slugify?
  await page.goto(`https://airion-cargo.store/w/${ws}`); await page.waitForTimeout(4500);
  const add=page.locator('button[aria-label="Add channel"]');
  if(await add.count()){ await add.first().click(); await page.waitForTimeout(1600);
    const ci=page.locator('[role="dialog"] input:visible').first();
    await ci.click(); await ci.fill(bad); await page.waitForTimeout(600);
    out.createFormValue=await ci.evaluate(e=>e.value);
    await page.keyboard.press('Escape');
  }
  // restore
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`); await page.waitForTimeout(5500);
  const det2=page.locator('button[aria-label="Channel details"], button[aria-label="Open channel details"]');
  if(await det2.count()){ await det2.first().click(); await page.waitForTimeout(1400); }
  const ab2=page.locator('[role="tab"]').filter({hasText:'About'});
  if(await ab2.count()){ await ab2.first().click(); await page.waitForTimeout(1100); }
  const i2=page.locator('input:visible').first();
  await i2.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.waitForTimeout(300); await i2.fill(before); await page.waitForTimeout(400);
  const sv=page.locator('button').filter({hasText:'Save'}).first();
  if(!(await sv.evaluate(e=>e.disabled))) { await sv.click(); await page.waitForTimeout(2500); }
  out.restored=await page.evaluate(async(ch)=>{
    const j=await (await fetch(`/api/v1/channels/${ch}`,{credentials:'include'})).json(); return j.name;}, ch);
  return out;
};
