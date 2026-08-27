export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  for(let i=0;i<8;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(220); }
  await comp.type('QA-V2-LIVE dash-dash **bold** _it_',{delay:35});
  await page.waitForTimeout(500);
  await page.keyboard.press('Enter'); await page.waitForTimeout(4000);
  return page.evaluate(async(ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[])[0];
    return {storedBody:m.body,
      rendered:(()=>{const e=document.querySelector(`main [data-message-id="${m.id}"]`);
        return e?(e.innerText||'').replace(/\s+/g,' ').slice(-40):null;})()};}, ch);
};
