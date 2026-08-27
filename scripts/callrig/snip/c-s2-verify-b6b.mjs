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
  const parent=await page.evaluate(async(ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-S2-B6PARENT2', idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, ch);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?thread=${parent}`);
  await page.waitForTimeout(7000);
  // type the reply into the THREAD composer (user path)
  const comps=page.locator('div[contenteditable="true"]');
  const tc=comps.last();
  await empty(page, tc);
  await tc.type('QA-S2-QMD3 **bold** _it_ a-b', {delay:35}); await page.waitForTimeout(500);
  const posts=[];
  const onReq=r=>{ if(/\/reply$/.test(r.url())&&r.method()==='POST') posts.push(JSON.parse(r.postData()||'{}').body); };
  page.on('request', onReq);
  await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  page.off('request', onReq);
  out.storedBody=posts[0];
  const rid=await page.evaluate(()=>{
    const e=[...document.querySelectorAll('[data-message-id]')].reverse()
      .find(x=>/QA-S2-QMD3/.test(x.innerText||''));
    return e? e.getAttribute('data-message-id'):null;});
  out.replyId=rid;
  out.replyAsRendered=await page.evaluate((id)=>{
    const e=document.querySelector(`[data-message-id="${id}"]`);
    return e? (e.innerText||'').replace(/\s+/g,' ').slice(0,70):'absent';}, rid);
  const el=page.locator(`[data-message-id="${rid}"]`).first();
  await el.hover(); await page.waitForTimeout(600);
  await el.locator('button[aria-label="Reply here"]').first().click();
  await page.waitForTimeout(1500);
  out.composerQuote=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    return [...document.querySelectorAll('body *')].filter(e=>e.children.length===0).filter(vis)
      .map(e=>(e.textContent||'').trim()).filter(t=>/QMD3/.test(t)).slice(0,4);});
  const tc2=page.locator('div[contenteditable="true"]').last();
  await tc2.click(); await tc2.type('QA-S2-B6QUOTING2', {delay:35}); await page.waitForTimeout(400);
  await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  out.sentQuote=await page.evaluate(()=>{
    const el=[...document.querySelectorAll('[data-message-id]')].reverse()
      .find(e=>/QA-S2-B6QUOTING2/.test(e.innerText||''));
    return el? (el.innerText||'').replace(/\s+/g,' ').slice(0,150):'not found';});
  return out;
};
