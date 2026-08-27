export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OVEWOTJW1AA86';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`);
  await page.waitForTimeout(8000);
  out.direct=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const comp=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    const m=document.querySelector('main');
    return {url:location.pathname, composer:!!comp,
      unavailable:/Unavailable user/i.test(document.body.innerText),
      main:(m?m.innerText:'').replace(/\s+/g,' ').slice(0,180),
      send:!!document.querySelector('button[aria-label="Send"]')};});
  // if the composer is there, try sending (ALK-3509)
  if(out.direct.composer){
    const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
    for(let i=0;i<6;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
      await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(200); }
    await comp.type('QA-S2-BLOCKSEND', {delay:35}); await page.waitForTimeout(400);
    const resps=[];
    const onResp=async(r)=>{ if(r.url().endsWith('/api/v1/messaging/messages')&&r.request().method()==='POST'){
      let b=''; try{b=(await r.text()).slice(0,110);}catch(e){}
      resps.push({status:r.status(), body:b}); } };
    page.on('response', onResp);
    await page.keyboard.press('Enter'); await page.waitForTimeout(4000);
    page.off('response', onResp);
    out.sendAttempt={resps, screen:await page.evaluate(()=>{
      const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
      const e=[...document.querySelectorAll('main [data-message-id]')].reverse()
        .find(x=>/QA-S2-BLOCKSEND/.test(x.innerText||''));
      return {rowPresent:!!e, rowText:e?(e.innerText||'').replace(/\s+/g,' ').slice(-60):null,
        notices:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis)
          .map(x=>x.textContent.trim().slice(0,60))};})};
  }
  // unblock (ALK-3519)
  out.unblock=await page.evaluate(async()=>{
    const r=await fetch('/api/v1/messaging/users/unblock',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify({user_id:'U4QCCAROL000001'})});
    return {status:r.status, body:(await r.text()).slice(0,60)};});
  await page.reload(); await page.waitForTimeout(8000);
  out.afterUnblock=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    return {dms:[...document.querySelectorAll('a[href*="/d/"]')].filter(vis)
        .map(a=>(a.innerText||'').replace(/\s+/g,' ').slice(0,18)),
      composer:!!document.querySelector('div[contenteditable="true"][aria-label="Compose message"]'),
      url:location.pathname};});
  return out;
};
