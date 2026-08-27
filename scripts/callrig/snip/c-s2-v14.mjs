const empty = async (page, comp) => {
  for (let i=0;i<8;i++){
    if ((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);
  }
  return false;
};
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(6500);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  await empty(page, comp);
  await comp.type('- QA-S2-V14 list item', {delay:35}); await page.waitForTimeout(500);
  const posts=[];
  const onReq=r=>{ if(r.url().endsWith('/api/v1/messaging/messages')&&r.method()==='POST') posts.push(JSON.parse(r.postData()||'{}').body); };
  page.on('request', onReq);
  await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  page.off('request', onReq);
  out.sentBody=posts[0];
  const el=page.locator('main [data-message-id]').filter({hasText:'QA-S2-V14'}).last();
  out.id=await el.getAttribute('data-message-id');
  out.beforeEdit=await el.evaluate(e=>({t:(e.innerText||'').replace(/\s+/g,' ').slice(0,60),
    li:e.querySelectorAll('li').length, ul:e.querySelectorAll('ul').length}));
  // edit and re-save without changing anything
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(500);
  await el.locator('button[aria-label="More actions"]').first().click({force:true});
  await page.waitForTimeout(800);
  const ed=page.locator('[role="menu"]').getByText('Edit',{exact:true}).first();
  out.editOffered=await ed.count();
  if(!out.editOffered) return out;
  await ed.click(); await page.waitForTimeout(1600);
  out.composerInEdit=await comp.evaluate(e=>e.innerText.slice(0,50));
  out.mdPressedInEdit=await page.locator('button[aria-label="Markdown formatting"]').first().getAttribute('aria-pressed');
  await comp.click(); await page.keyboard.press('End');
  await comp.type(' Z', {delay:40}); await page.waitForTimeout(500);
  out.composerEdited=await comp.evaluate(e=>e.innerText.slice(0,60));
  const patches=[];
  const onReq2=r=>{ if(r.method()==='PATCH') patches.push({u:r.url().split('/api/v1')[1].slice(0,50), body:(r.postData()||'').slice(0,90)}); };
  page.on('request', onReq2);
  const save=page.locator('button[aria-label="Save changes"]').first();
  if(await save.count()) await save.click(); else await page.keyboard.press('Meta+Enter');
  await page.waitForTimeout(3000);
  page.off('request', onReq2);
  out.patches=patches;
  out.afterEdit=await page.evaluate((id)=>{
    const e=document.querySelector(`[data-message-id="${id}"]`);
    return e? {t:(e.innerText||'').replace(/\s+/g,' ').slice(0,60),
      li:e.querySelectorAll('li').length, ul:e.querySelectorAll('ul').length}:'absent';}, out.id);
  return out;
};
