export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(11000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  for(let k=0;k<6;k++){
    if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);}
  await comp.click();
  const tag='QA-UNDO-probe-long-message-body';
  await page.keyboard.type(tag);
  await page.waitForTimeout(800);
  const typed=await comp.evaluate(e=>e.innerText.trim().slice(0,32));
  await page.route('**/api/v1/messaging/messages', r=>r.abort('failed'));
  await page.locator('button[aria-label="Send"]').first().click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(6000);
  const afterSend=await comp.evaluate(e=>e.innerText.trim().slice(0,32));
  await comp.click();
  await page.keyboard.press('Meta+z'); await page.waitForTimeout(1200);
  const afterUndo1=await comp.evaluate(e=>e.innerText.trim().slice(0,32));
  await page.keyboard.press('Meta+z'); await page.waitForTimeout(1200);
  const afterUndo2=await comp.evaluate(e=>e.innerText.trim().slice(0,32));
  await page.unroute('**/api/v1/messaging/messages');
  const server=await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=5',{credentials:'include'});
    const j=await r.json(); const m=(j&&j.messages)||[];
    return m.some(x=>(x.body||'').includes('QA\\-UNDO')||(x.body||'').includes('QA-UNDO'));});
  return {typed, afterSend, afterUndo1, afterUndo2, messageOnServer:server};
};
