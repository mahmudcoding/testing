export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OWOSZN35PTPMA';  // project/alpha?two
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}`);
  await page.waitForTimeout(7000);
  out.sidebarLink=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const a=[...document.querySelectorAll('a[href*="/c/"]')].filter(vis)
      .find(x=>/alpha/.test(x.innerText||''));
    return a? {txt:(a.innerText||'').replace(/\s+/g,' ').slice(0,30), href:a.getAttribute('href')}:null;});
  if(out.sidebarLink){
    await page.locator(`a[href="${out.sidebarLink.href}"]`).first().click();
    await page.waitForTimeout(6000);
    out.afterClick={url:page.url().replace('https://airion-cargo.store',''),
      header:await page.evaluate(()=>{const h=document.querySelector('main header')||document.querySelector('header');
        return h? (h.innerText||'').replace(/\s+/g,' ').slice(0,60):null;}),
      msgs:await page.evaluate(()=>document.querySelectorAll('main [data-message-id]').length)};
  }
  // direct navigation
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(6500);
  out.direct={url:page.url().replace('https://airion-cargo.store',''),
    header:await page.evaluate(()=>{const h=document.querySelector('main header')||document.querySelector('header');
      return h? (h.innerText||'').replace(/\s+/g,' ').slice(0,60):null;}),
    msgs:await page.evaluate(()=>document.querySelectorAll('main [data-message-id]').length)};
  // can we send there?
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  out.composer=await comp.count();
  if(out.composer){
    for(let i=0;i<6;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
      await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(200); }
    await comp.type('QA-S2-WEIRDNAME ping', {delay:35}); await page.waitForTimeout(400);
    const posts=[];
    const onReq=r=>{ if(r.url().endsWith('/api/v1/messaging/messages')&&r.method()==='POST') posts.push(r.postData().slice(0,60)); };
    page.on('request', onReq);
    await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
    page.off('request', onReq);
    out.sent=posts;
  }
  // share link of a message in that channel
  return out;
};
