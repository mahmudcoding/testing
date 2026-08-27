export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OWSYMJ03CFIKL';
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`);
  await page.waitForTimeout(12000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  for(let k=0;k<6;k++){
    if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);}
  await comp.click();
  await page.keyboard.type('QA-DMFAIL probe text');
  await page.waitForTimeout(900);
  const typed=await comp.evaluate(e=>e.innerText.trim().slice(0,26));
  await page.route('**/api/v1/messaging/messages', r=>r.abort('failed'));
  await page.locator('button[aria-label="Send"]').first().click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(7000);
  const after=await comp.evaluate(e=>e.innerText.trim().slice(0,26));
  const toasts=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
      .map(e=>(e.innerText||'').trim().slice(0,52)).filter(Boolean).slice(0,2);});
  await page.unroute('**/api/v1/messaging/messages');
  return {surface:'direct message', typed, afterFailedSend:after, kept:after===typed, toasts};
};
