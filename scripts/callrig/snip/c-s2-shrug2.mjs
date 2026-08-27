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
  for (const cmd of ['/shrug','/tableflip']){
    await clear();
    await comp.click();
    await page.keyboard.type(cmd+' QA-RECHECK2 keep this');
    await page.waitForTimeout(1600);
    out[cmd]={typed:await comp.evaluate(e=>e.innerText.trim().slice(0,40)),
      focus:await page.evaluate(()=>document.activeElement?.getAttribute('aria-label')||document.activeElement?.tagName),
      suggestionOpen:await page.evaluate(()=>{
        const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
        return [...document.querySelectorAll('[role="listbox"],[role="menu"]')].filter(v).length;})};
    const posts=[];
    const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/messaging/messages')&&r.method()==='POST')
      {try{posts.push(String(r.postData()||'').slice(0,90));}catch(e){}}};
    page.on('request',onReq);
    await page.keyboard.press('Enter');            // NO Escape — as the finding describes
    await page.waitForTimeout(3500);
    out[cmd].afterEnter1=await comp.evaluate(e=>e.innerText.trim().slice(0,40));
    out[cmd].textSurvived=out[cmd].afterEnter1.includes('QA-RECHECK2');
    out[cmd].sentOnEnter1=posts.length>0;
    await page.keyboard.press('Enter');            // second Enter
    await page.waitForTimeout(3500);
    page.off('request',onReq);
    out[cmd].afterEnter2=await comp.evaluate(e=>e.innerText.trim().slice(0,40));
    out[cmd].bodiesSent=posts.slice(0,2);
  }
  await clear();
  return out;
};
