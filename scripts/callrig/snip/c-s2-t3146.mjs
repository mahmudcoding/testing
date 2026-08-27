const empty = async (page, comp) => {
  for (let i=0;i<8;i++){
    if ((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);
  }
  return false;
};
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7500);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  await empty(page, comp);
  await comp.type('QA-S2-T3146 original', {delay:35}); await page.waitForTimeout(400);
  await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  const el=page.locator('main [data-message-id]').filter({hasText:'QA-S2-T3146'}).last();
  out.id=await el.getAttribute('data-message-id');
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(500);
  await el.locator('button[aria-label="More actions"]').first().click({force:true});
  await page.waitForTimeout(800);
  await page.locator('[role="menu"]').getByText('Edit',{exact:true}).first().click();
  await page.waitForTimeout(1800);
  await comp.click(); await page.keyboard.press('End');
  await comp.type(' EDITED', {delay:40}); await page.waitForTimeout(400);
  const save=page.locator('button[aria-label="Save changes"]').first();
  if(await save.count() && !(await save.evaluate(e=>e.disabled))) await save.click();
  await page.waitForTimeout(3500);
  out.authorView=await page.evaluate((id)=>{
    const e=document.querySelector(`[data-message-id="${id}"]`);
    return e? (e.innerText||'').replace(/\s+/g,' ').slice(-60):'absent';}, out.id);
  out.api=await page.evaluate(async({ch,id})=>{
    const j=await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=4`,{credentials:'include'})).json();
    const m=(j.messages||j.data||j||[]).find(x=>x.id===id);
    return m? {body:m.body, keys:Object.keys(m).filter(k=>/edit|updated/i.test(k)),
      edited_at:m.edited_at??null, updated_at:m.updated_at??null}:'absent';}, {ch,id:out.id});
  return out;
};
