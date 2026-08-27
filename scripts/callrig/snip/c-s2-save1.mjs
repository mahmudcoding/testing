export default async ({page}) => {
  const out={reqs:[]};
  const onReq=r=>{ if(r.url().includes('/api/v1/')&&r.method()!=='GET')
    out.reqs.push(r.method()+' '+r.url().split('/api/v1')[1].slice(0,50)+' '+(r.postData()||'').slice(0,70)); };
  // send a fresh marker message first
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  await comp.click(); await page.keyboard.press('Control+A'); await page.keyboard.press('Backspace');
  await page.waitForTimeout(300);
  await comp.type('QA-S2-SAVEDEV', {delay:35}); await page.waitForTimeout(300);
  await page.keyboard.press('Enter'); await page.waitForTimeout(2500);
  const msg=page.locator('main [data-message-id]').filter({hasText:'QA-S2-SAVEDEV'}).last();
  out.id=await msg.getAttribute('data-message-id');
  await msg.scrollIntoViewIfNeeded(); await msg.hover(); await page.waitForTimeout(400);
  page.on('request', onReq);
  await msg.locator('button[aria-label="Save"]').first().click();
  await page.waitForTimeout(2500);
  page.off('request', onReq);
  await msg.hover(); await page.waitForTimeout(500);
  out.afterLabels = await msg.evaluate(el=>[...el.querySelectorAll('button')]
    .filter(b=>b.getBoundingClientRect().height>0).map(b=>b.getAttribute('aria-label')));
  out.ls = await page.evaluate(()=>String(localStorage.getItem(
    Object.keys(localStorage).find(k=>k.startsWith('aloqa.saved-messages'))||'')).slice(0,200));
  out.toast = await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"]')]
    .filter(e=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;})
    .map(e=>e.textContent.trim().slice(0,60)));
  return out;
};
