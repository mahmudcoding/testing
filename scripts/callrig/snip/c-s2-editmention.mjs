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
  // plain message first, no mention
  await comp.type('QA-S2-EDMENT plain first', {delay:35}); await page.waitForTimeout(400);
  await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  const el=page.locator('main [data-message-id]').filter({hasText:'QA-S2-EDMENT'}).last();
  out.id=await el.getAttribute('data-message-id');
  out.storedBefore=await page.evaluate(async({ch,id})=>{
    const j=await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=4`,{credentials:'include'})).json();
    const m=(j.messages||j.data||j||[]).find(x=>x.id===id);
    return m? {body:m.body, mention_ids:m.mention_ids??null}:'absent';}, {ch,id:out.id});
  // edit: add a picked mention
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(500);
  await el.locator('button[aria-label="More actions"]').first().click({force:true});
  await page.waitForTimeout(800);
  await page.locator('[role="menu"]').getByText('Edit',{exact:true}).first().click();
  await page.waitForTimeout(1800);
  await comp.click(); await page.keyboard.press('End');
  await comp.type(' @qa_c_bob', {delay:55}); await page.waitForTimeout(1300);
  const o=page.locator('[role="option"]').filter({hasText:'qa_c_bob'});
  out.pickerRows=await o.count();
  if(await o.count()) await o.first().click();
  await page.waitForTimeout(800);
  out.composerNow=await comp.evaluate(e=>e.innerText.slice(0,60));
  const patches=[];
  const onReq=r=>{ if(r.method()==='PATCH') patches.push({u:r.url().split('/api/v1')[1].slice(0,50), body:(r.postData()||'').slice(0,150)}); };
  page.on('request', onReq);
  const save=page.locator('button[aria-label="Save changes"]').first();
  if(await save.count() && !(await save.evaluate(e=>e.disabled))) await save.click();
  await page.waitForTimeout(3500);
  page.off('request', onReq);
  out.patch=patches;
  out.storedAfter=await page.evaluate(async({ch,id})=>{
    const j=await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=4`,{credentials:'include'})).json();
    const m=(j.messages||j.data||j||[]).find(x=>x.id===id);
    return m? {body:m.body, mention_ids:m.mention_ids??null}:'absent';}, {ch,id:out.id});
  return out;
};
