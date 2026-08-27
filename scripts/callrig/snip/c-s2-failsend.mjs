export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  const runCase=async(label, routeFn)=>{
    await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
    await page.waitForTimeout(11000);
    const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
    for(let k=0;k<6;k++){
      if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
      await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
      await page.waitForTimeout(250);}
    await comp.click();
    await page.keyboard.type('QA-FAILSEND-'+label);
    await page.waitForTimeout(800);
    const typed=await comp.evaluate(e=>e.innerText.trim().slice(0,26));
    await page.route('**/api/v1/messaging/messages', routeFn);
    await page.locator('button[aria-label="Send"]').first().click({timeout:6000}).catch(()=>{});
    await page.waitForTimeout(7000);
    const after=await comp.evaluate(e=>e.innerText.trim().slice(0,26));
    const toasts=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      return [...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
        .map(e=>(e.innerText||'').trim().slice(0,50)).filter(Boolean).slice(0,2);});
    await page.unroute('**/api/v1/messaging/messages');
    return {label, typed, afterSend:after, kept:after===typed, toasts};
  };
  out.networkFail=await runCase('net', r=>r.abort('failed'));
  out.server500=await runCase('500', r=>r.fulfill({status:500,
    contentType:'application/json', body:'{"code":500,"key":"COMMON_INTERNAL","message":"boom"}'}));
  out.forbidden=await runCase('403', r=>r.fulfill({status:403,
    contentType:'application/json', body:'{"code":403,"key":"MESSAGING_CHANNEL_ARCHIVED","message":"channel is archived"}'}));
  return out;
};
