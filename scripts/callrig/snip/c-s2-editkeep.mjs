export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7500);
  const id=await page.evaluate(async(ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-S2-EDKEEP base', idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, ch);
  out.id=id;
  // add a reaction and a pin via API so state is unambiguous
  out.setup=await page.evaluate(async({ch,id})=>{
    const a=await fetch(`/api/v1/messaging/channels/${ch}/messages/${id}/reactions`,{method:'POST',
      credentials:'include',headers:{'content-type':'application/json'},body:JSON.stringify({emoji:'🎯'})});
    const b=await fetch(`/api/v1/messaging/channels/${ch}/messages/${id}/pin`,{method:'POST',
      credentials:'include',headers:{'content-type':'application/json'},body:JSON.stringify({pin:true})});
    return {reaction:a.status, pin:b.status};}, {ch,id});
  const state=()=>page.evaluate(async({ch,id})=>{
    const j=await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=6`,{credentials:'include'})).json();
    const m=(j.messages||j.data||j||[]).find(x=>x.id===id);
    return m? {body:m.body, reactions:(m.reactions||[]).map(r=>r.emoji+':'+r.count), pinned:m.pinned??null,
      edited:m.edited??null}:'absent';}, {ch,id});
  out.before=await state();
  await page.reload(); await page.waitForTimeout(7000);
  const el=page.locator(`[data-message-id="${id}"]`).first();
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(600);
  await el.locator('button[aria-label="More actions"]').first().click({force:true});
  await page.waitForTimeout(900);
  await page.locator('[role="menu"]').getByText('Edit',{exact:true}).first().click();
  await page.waitForTimeout(1800);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  await comp.click(); await page.keyboard.press('End');
  await comp.type(' EDITED', {delay:40}); await page.waitForTimeout(400);
  const save=page.locator('button[aria-label="Save changes"]').first();
  if(await save.count() && !(await save.evaluate(e=>e.disabled))) await save.click();
  await page.waitForTimeout(3500);
  out.after=await state();
  out.onScreen=await page.evaluate((id)=>{
    const e=document.querySelector(`[data-message-id="${id}"]`);
    return e? {txt:(e.innerText||'').replace(/\s+/g,' ').slice(-60),
      chips:[...e.querySelectorAll('button')].map(b=>b.getAttribute('aria-label'))
        .filter(l=>l&&/react/i.test(l)).slice(0,3)}:'absent';}, id);
  // cleanup
  await page.evaluate(async({ch,id})=>{
    await fetch(`/api/v1/messaging/channels/${ch}/messages/${id}/pin`,{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({pin:false})});}, {ch,id});
  return out;
};
