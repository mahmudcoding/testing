export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  if(!page.url().includes('/chat/saved')){
    await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`); await page.waitForTimeout(6000); }
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  out.composer=await comp.count();
  if(!out.composer) return out;
  for(let i=0;i<6;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(200); }
  out.rowsBefore = await page.evaluate(()=>document.querySelectorAll('main [data-message-id]').length);
  await comp.type('QA-S2-SAVEDSEND note to self', {delay:35}); await page.waitForTimeout(400);
  const posts=[];
  const onReq=r=>{ if(r.url().includes('/api/v1/messaging/')&&r.method()==='POST')
    posts.push({u:r.url().split('/api/v1')[1].slice(0,40), body:(r.postData()||'').slice(0,110)}); };
  page.on('request', onReq);
  await page.keyboard.press('Enter'); await page.waitForTimeout(3500);
  page.off('request', onReq);
  out.posts=posts;
  out.rowsAfter = await page.evaluate(()=>document.querySelectorAll('main [data-message-id]').length);
  out.tail = await page.evaluate(()=>[...document.querySelectorAll('main [data-message-id]')].slice(-2)
    .map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,70)));
  out.notices = await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"]')]
    .filter(e=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;})
    .map(e=>e.textContent.trim().slice(0,70)));
  await page.reload(); await page.waitForTimeout(6000);
  out.afterReload = await page.evaluate(()=>({
    rows:document.querySelectorAll('main [data-message-id]').length,
    tail:[...document.querySelectorAll('main [data-message-id]')].slice(-2)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,70))}));
  return out;
};
