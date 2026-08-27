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
  await page.waitForTimeout(7000);
  // parent + reply, both via API so the bodies are the default (escaped) form
  const parent=await page.evaluate(async(ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-S2-B6PARENT', idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, ch);
  const reply=await page.evaluate(async(parent)=>{
    const r=await fetch(`/api/v1/messaging/messages/${parent}/reply`,{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({body:'QA-S2-QMD2 **bold** _it_ a-b', idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, parent);
  out.parent=parent; out.reply=reply;
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?thread=${parent}`);
  await page.waitForTimeout(7000);
  out.replyAsRendered = await page.evaluate((id)=>{
    const e=document.querySelector(`[data-message-id="${id}"]`);
    return e? (e.innerText||'').replace(/\s+/g,' ').slice(0,80):'absent';}, reply);
  const el=page.locator(`[data-message-id="${reply}"]`).first();
  await el.hover(); await page.waitForTimeout(600);
  const rh=el.locator('button[aria-label="Reply here"]');
  out.replyHere=await rh.count();
  if(!out.replyHere) return out;
  await rh.first().click(); await page.waitForTimeout(1500);
  out.composerQuote = await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    return [...document.querySelectorAll('body *')].filter(e=>e.children.length===0).filter(vis)
      .map(e=>(e.textContent||'').trim()).filter(t=>/QMD2/.test(t)).slice(0,4);});
  const comps=page.locator('div[contenteditable="true"]');
  const tc=comps.last();
  await tc.click(); await tc.type('QA-S2-B6QUOTING', {delay:35}); await page.waitForTimeout(400);
  await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  out.sentQuote = await page.evaluate(()=>{
    const el=[...document.querySelectorAll('[data-message-id]')].reverse()
      .find(e=>/QA-S2-B6QUOTING/.test(e.innerText||''));
    return el? (el.innerText||'').replace(/\s+/g,' ').slice(0,140):'not found';});
  return out;
};
