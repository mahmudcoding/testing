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
  await page.waitForTimeout(7000);
  const id=await page.evaluate(async(ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-S2-EDITEMPTY target', idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, ch);
  out.id=id;
  await page.waitForTimeout(3000);
  const el=page.locator(`[data-message-id="${id}"]`).first();
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(500);
  await el.locator('button[aria-label="More actions"]').first().click({force:true});
  await page.waitForTimeout(800);
  await page.locator('[role="menu"]').getByText('Edit',{exact:true}).first().click();
  await page.waitForTimeout(1800);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.waitForTimeout(600);
  out.composerNow=await comp.evaluate(e=>e.innerText.replace(/\n/g,'\\n').slice(0,30));
  const save=page.locator('button[aria-label="Save changes"]').first();
  out.saveDisabled=await save.evaluate(e=>e.disabled);
  const reqs=[];
  const onReq=r=>{ if(r.method()==='PATCH'||r.method()==='DELETE') reqs.push({m:r.method(), body:(r.postData()||'').slice(0,60)}); };
  page.on('request', onReq);
  if(!out.saveDisabled){ await save.click(); await page.waitForTimeout(3000); }
  page.off('request', onReq);
  out.reqs=reqs;
  out.notices=await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"]')]
    .filter(e=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;})
    .map(e=>e.textContent.trim().slice(0,60)));
  out.msgNow=await page.evaluate((id)=>{const e=document.querySelector(`[data-message-id="${id}"]`);
    return e? (e.innerText||'').replace(/\s+/g,' ').slice(0,60):'gone from DOM';}, id);
  out.server=await page.evaluate(async({ch,id})=>{
    const j=await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=8`,{credentials:'include'})).json();
    const m=(j.messages||j.data||j||[]).find(x=>x.id===id);
    return m? {body:m.body, deleted:m.deleted_at??null}:'absent';}, {ch,id});
  const cancel=page.locator('button[aria-label="Cancel editing"]').first();
  if(await cancel.count()) await cancel.click();
  await empty(page, comp);
  return out;
};
