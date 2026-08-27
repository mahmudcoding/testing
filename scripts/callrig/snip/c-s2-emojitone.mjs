export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7000);
  const id=await page.evaluate(async(ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-S2-TONE target', idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, ch);
  out.id=id;
  await page.waitForTimeout(3000);
  const el=page.locator(`[data-message-id="${id}"]`).first();
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(500);
  await el.locator('button[aria-label="Add reaction"]').first().click();
  await page.waitForTimeout(2000);
  out.picker=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const w=[...document.querySelectorAll('[role="dialog"],[data-radix-popper-content-wrapper]')]
      .find(x=>x.getBoundingClientRect().height>40);
    if(!w) return 'no picker';
    return {txt:(w.innerText||'').replace(/\s+/g,' ').slice(0,160),
      controls:[...w.querySelectorAll('button,input,[role="tab"]')].filter(vis)
        .map(b=>b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,10)).slice(0,26),
      hasSearch: !!w.querySelector('input')};});
  // search for thumbs up
  const inp=page.locator('[role="dialog"] input, [data-radix-popper-content-wrapper] input').first();
  if(await inp.count()){ await inp.fill('thumbs'); await page.waitForTimeout(1500);
    out.searchResult=await page.evaluate(()=>{
      const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
      const w=[...document.querySelectorAll('[role="dialog"],[data-radix-popper-content-wrapper]')]
        .find(x=>x.getBoundingClientRect().height>40);
      return {btns:[...w.querySelectorAll('button')].filter(vis)
        .map(b=>b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,6)).slice(0,14)};});
  }
  await page.keyboard.press('Escape');
  return out;
};
