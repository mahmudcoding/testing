export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7500);
  const parent=await page.evaluate(async(ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-S2-RLC parent', idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, ch);
  const replies=[];
  for (let i=1;i<=3;i++){
    const id=await page.evaluate(async({parent,i})=>{
      const r=await fetch(`/api/v1/messaging/messages/${parent}/reply`,{method:'POST',credentials:'include',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({body:`QA-S2-RLC reply ${i}`, idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
      return (await r.json()).id;}, {parent,i});
    replies.push(id);
  }
  out.parent=parent; out.replies=replies;
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?thread=${parent}`);
  await page.waitForTimeout(7500);
  const panel=()=>page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const head=[...document.querySelectorAll('*')].filter(e=>e.children.length===0).filter(vis)
      .map(e=>(e.textContent||'').trim()).filter(t=>/^Replies \(/.test(t))[0]||null;
    const rows=[...document.querySelectorAll('[data-message-id]')]
      .filter(e=>e.getBoundingClientRect().x>900)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(-30));
    const marker=[...document.querySelectorAll('*')].filter(e=>e.children.length===0).filter(vis)
      .map(e=>(e.textContent||'').trim()).filter(t=>/repl(y|ies)$/.test(t))[0]||null;
    return {head, rowCount:rows.length, rows:rows.slice(-4), channelMarker:marker};});
  out.initial=await panel();
  // edit reply 2 through the UI
  const el=page.locator(`[data-message-id="${replies[1]}"]`).first();
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(600);
  await el.locator('button[aria-label="More actions"]').first().click({force:true});
  await page.waitForTimeout(900);
  const ed=page.locator('[role="menu"]').getByText('Edit',{exact:true}).first();
  out.editOffered=await ed.count();
  if(out.editOffered){
    await ed.click(); await page.waitForTimeout(1800);
    const comps=page.locator('div[contenteditable="true"]');
    const tc=comps.last();
    await tc.click(); await page.keyboard.press('End');
    await tc.type(' EDITED', {delay:40}); await page.waitForTimeout(400);
    const save=page.locator('button[aria-label="Save changes"]').first();
    if(await save.count() && !(await save.evaluate(e=>e.disabled))) await save.click();
    await page.waitForTimeout(3000);
  } else await page.keyboard.press('Escape');
  out.afterEdit=await panel();
  // delete reply 3 via API, then observe live
  out.del=await page.evaluate(async({ch,id})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages`,{method:'DELETE',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify({message_ids:[id]})});
    return {status:r.status};}, {ch,id:replies[2]});
  await page.waitForTimeout(5000);
  out.afterDeleteLive=await panel();
  await page.reload(); await page.waitForTimeout(7500);
  out.afterReload=await panel();
  return out;
};
