export default async ({page}) => {
  const out={};
  const box=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  out.beforeTyping=await box.evaluate(e=>e.innerText.trim().slice(0,30));
  await box.click();
  await page.keyboard.press('Meta+A');
  await page.keyboard.type('QA-EDITFAIL4 edited');
  await page.waitForTimeout(900);
  out.typed=await box.evaluate(e=>e.innerText.trim().slice(0,30));
  await page.route('**/api/v1/messaging/messages/**', r=>{
    const m=r.request().method();
    return (m==='PATCH'||m==='PUT'||m==='POST') ? r.abort('failed') : r.continue();});
  const seen=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&/messages/.test(u))
    seen.push(r.method()+' '+u.split('/api/v1')[1].slice(0,44));};
  page.on('request',onReq);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(7000);
  page.off('request',onReq);
  await page.unroute('**/api/v1/messaging/messages/**');
  out.requests=seen.slice(0,3);
  out.after=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const c=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    return {composerText:c?(c.innerText||'').trim().slice(0,30):'no composer',
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
        .map(e=>(e.innerText||'').trim().slice(0,52)).filter(Boolean).slice(0,3),
      stillEditingHint:(document.body.innerText||'').includes('Editing message')||
                       (document.body.innerText||'').includes('Cancel edit')};});
  return out;
};
