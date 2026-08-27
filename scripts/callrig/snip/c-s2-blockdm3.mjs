export default async ({page}) => {
  const out={};
  // notice outside message bodies?
  out.noticeOutsideMessages=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const inMsg=(e)=>!!e.closest('[data-message-id]');
    return [...document.querySelectorAll('main *')].filter(v)
      .filter(e=>e.children.length===0 && !inMsg(e))
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim())
      .filter(t=>/block/i.test(t) && t.length<90).slice(0,3);});
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  for(let k=0;k<6;k++){
    if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);}
  await comp.click();
  await page.keyboard.type('QA-BLOCKUI probe');
  await page.waitForTimeout(800);
  out.typed=await comp.evaluate(e=>e.innerText.trim().slice(0,22));
  const toasts=new Set();
  const poll=(async()=>{const t0=Date.now();
    while(Date.now()-t0<11000){
      const t=await page.evaluate(()=>{
        const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
        return [...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
          .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean);});
      t.forEach(x=>toasts.add(x.slice(0,90)));
      await page.waitForTimeout(300);}})();
  await page.locator('button[aria-label="Send"]').first().click({timeout:6000}).catch(()=>{out.sendFail=true});
  await poll;
  out.toasts=[...toasts];
  out.composerAfter=await comp.evaluate(e=>e.innerText.trim().slice(0,22));
  return out;
};
