export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  const clear=async()=>{for(let k=0;k<6;k++){
    if((await comp.evaluate(e=>e.innerText.trim()))==='') return;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);}};
  const out={};
  for (const cmd of ['/shrug','/tableflip','/me']){
    await clear();
    await comp.click();
    await page.keyboard.type(cmd+' QA-RECHECK keep this text');
    await page.waitForTimeout(1400);
    await page.keyboard.press('Escape');           // dismiss the suggestion list
    await page.waitForTimeout(400);
    const typed=await comp.evaluate(e=>e.innerText.trim().slice(0,44));
    const posts=[];
    const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/messaging/messages')&&r.method()==='POST')
      {try{posts.push(String(r.postData()||'').slice(0,80));}catch(e){}}};
    page.on('request',onReq);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3500);
    const afterFirst=await comp.evaluate(e=>e.innerText.trim().slice(0,44));
    page.off('request',onReq);
    out[cmd]={typed, afterEnter:afterFirst,
      textSurvived: afterFirst.includes('QA-RECHECK'),
      sentOnFirstEnter: posts.length>0, body:posts[0]||null};
  }
  await clear();
  return out;
};
