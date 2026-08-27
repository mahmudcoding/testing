export default async ({page}) => {
  const out={};
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  const clear=async()=>{await comp.click();await page.keyboard.press('Control+A');await page.keyboard.press('Backspace');await page.waitForTimeout(250);};
  await clear();
  await comp.type('/', {delay:60}); await page.waitForTimeout(1300);
  out.menuText = await page.evaluate(()=>{
    const w=document.querySelector('[role="listbox"],[role="menu"],[data-radix-popper-content-wrapper]');
    return w? (w.innerText||'').replace(/\s+/g,' ').slice(0,200):'none';});
  out.options = await page.evaluate(()=>[...document.querySelectorAll('[role="option"]')]
    .filter(e=>e.getBoundingClientRect().height>0).map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,40)));
  await clear();

  // /shrug
  await comp.type('/shrug', {delay:60}); await page.waitForTimeout(1200);
  out.shrugOptions = await page.evaluate(()=>[...document.querySelectorAll('[role="option"]')]
    .filter(e=>e.getBoundingClientRect().height>0).map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,30)));
  await page.keyboard.press('Enter'); await page.waitForTimeout(1000);
  out.afterPickShrug = await comp.evaluate(e=>e.innerText.slice(0,60));
  await comp.type(' QA-S2-SHRUG', {delay:35}); await page.waitForTimeout(400);
  const posts=[];
  const onReq=r=>{ if(r.url().endsWith('/api/v1/messaging/messages')&&r.method()==='POST') posts.push((r.postData()||'').slice(0,160)); };
  page.on('request', onReq);
  await page.keyboard.press('Enter'); await page.waitForTimeout(2500);
  page.off('request', onReq);
  out.shrugPost=posts;
  out.shrugRendered = await page.evaluate(()=>{
    const el=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(e=>/QA-S2-SHRUG/.test(e.innerText||''));
    return el? (el.innerText||'').replace(/\s+/g,' ').slice(0,90):'not found';});
  return out;
};
