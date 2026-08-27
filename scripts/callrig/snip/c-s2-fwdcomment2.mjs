export default async ({page}) => {
  const out={};
  const box=page.locator('div[contenteditable][aria-label="Add a comment (optional)"]').first();
  out.boxFound=await box.count();
  if(!out.boxFound) return out;
  await box.click();
  await page.keyboard.type('QA-FWDCOMMENT text');
  await page.waitForTimeout(900);
  out.afterTyping=await box.evaluate(e=>e.innerText.trim().slice(0,26));
  // clear it
  for(let i=0;i<6;i++){
    if((await box.evaluate(e=>e.innerText.trim()))==='') break;
    await box.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(300);}
  out.afterClearing=await box.evaluate(e=>e.innerText.trim().slice(0,26));
  out.cleared=out.afterClearing==='';
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()==='POST')
    reqs.push(u.split('/api/v1')[1].slice(0,40));};
  page.on('request',onReq);
  await page.locator('[role="dialog"] button').filter({hasText:/^Send$/}).first()
    .click({timeout:6000}).catch(()=>{out.sendFail=true});
  await page.waitForTimeout(7000);
  page.off('request',onReq);
  out.requests=reqs.slice(0,3);
  out.after=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return {dialogsOpen:[...document.querySelectorAll('[role="dialog"]')].filter(v).length,
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
        .map(e=>(e.innerText||'').trim().slice(0,50)).filter(Boolean).slice(0,2)};});
  return out;
};
