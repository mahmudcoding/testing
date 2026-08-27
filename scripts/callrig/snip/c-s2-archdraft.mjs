export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const url=page.url();
  const runs=[];
  for (let i=1;i<=3;i++){
    await page.goto(url); await page.waitForTimeout(11000);
    const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
    for(let k=0;k<6;k++){
      if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
      await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
      await page.waitForTimeout(250);}
    await comp.click();
    const tag='QA-ARCHDRAFT-'+i;
    await page.keyboard.type(tag);
    await page.waitForTimeout(900);
    const before=await comp.evaluate(e=>e.innerText.trim().slice(0,24));
    await page.locator('button[aria-label="Send"]').first().click({timeout:6000}).catch(()=>{});
    await page.waitForTimeout(1500);
    const at1500=await comp.evaluate(e=>e.innerText.trim().slice(0,24));
    await page.waitForTimeout(5000);
    const at6500=await comp.evaluate(e=>e.innerText.trim().slice(0,24));
    runs.push({run:i, typed:before, at1_5s:at1500, at6_5s:at6500});
  }
  // does it come back after reopening the thread?
  await page.goto(url); await page.waitForTimeout(11000);
  const afterReopen=await page.evaluate(()=>{
    const c=document.querySelector('div[contenteditable][aria-label="Compose message"]');
    return c?(c.innerText||'').trim().slice(0,24):'no composer';});
  return {runs, afterReopen};
};
