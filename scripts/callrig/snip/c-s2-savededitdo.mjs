export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`);
  await page.waitForTimeout(7000);
  // pick a saved copy (has "View original")
  const target=await page.evaluate(()=>{
    const el=[...document.querySelectorAll('main [data-message-id]')]
      .find(e=>/View original/.test(e.innerText||''));
    return el? el.getAttribute('data-message-id'):null;});
  out.target=target;
  if(!target) return out;
  const el=page.locator(`[data-message-id="${target}"]`);
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(500);
  await el.locator('button[aria-label="More actions"]').first().click({force:true});
  await page.waitForTimeout(700);
  const ed=page.locator('[role="menu"]').getByText('Edit',{exact:true}).first();
  out.editItem=await ed.count();
  if(!out.editItem) return out;
  await ed.click(); await page.waitForTimeout(1500);
  const box=page.locator(`[data-message-id="${target}"] div[contenteditable="true"]`).first();
  out.editorOpen=await box.count();
  if(!out.editorOpen){
    out.anyEditor = await page.evaluate(()=>[...document.querySelectorAll('div[contenteditable="true"]')]
      .map(e=>e.getAttribute('aria-label')));
    return out;
  }
  await box.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.waitForTimeout(300);
  await box.type('QA-S2-SAVEDEDIT2 rewritten', {delay:35});
  await page.waitForTimeout(400);
  const reqs=[];
  const onReq=r=>{ if(r.url().includes('/api/v1/messaging/')&&r.method()!=='GET')
    reqs.push({m:r.method(), u:r.url().split('/api/v1')[1].slice(0,50), body:(r.postData()||'').slice(0,80)}); };
  page.on('request', onReq);
  await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  page.off('request', onReq);
  out.reqs=reqs;
  out.after = await page.evaluate((id)=>{
    const e=document.querySelector(`[data-message-id="${id}"]`);
    return e? (e.innerText||'').replace(/\s+/g,' ').slice(0,90):'gone';}, target);
  return out;
};
