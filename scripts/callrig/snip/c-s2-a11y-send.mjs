export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(11000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  for(let k=0;k<6;k++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);}
  await comp.click();
  await page.keyboard.type('QA-A11Y-RC dash-dash **bold** _it_');
  await page.waitForTimeout(900);
  await page.locator('button[aria-label="Send"]').first().click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(6000);
  return page.evaluate(async ()=>{
    const r=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=2',{credentials:'include'});
    const j=await r.json(); const m=(j&&j.messages)||[];
    const hit=m.find(x=>String(x.body||'').replace(/\\/g,'').includes('QA-A11Y-RC'));
    return {storedBody:hit?hit.body:'not found'};});
};
