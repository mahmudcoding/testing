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
  await page.waitForTimeout(7500);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  // --- BUG-19: /me picked from the menu, sent with the Send button
  await empty(page, comp);
  await comp.type('/me', {delay:60}); await page.waitForTimeout(1300);
  const o=page.locator('[role="option"]').first();
  out.v19_opt=await o.count()? (await o.innerText()).replace(/\s+/g,' ').slice(0,28):'none';
  if(await o.count()) await o.click();
  await page.waitForTimeout(800);
  out.v19_afterPick=await comp.evaluate(e=>e.innerText);
  await comp.type(' QA-S2-V19 waves', {delay:35}); await page.waitForTimeout(400);
  const posts=[];
  const onReq=r=>{ if(r.url().endsWith('/api/v1/messaging/messages')&&r.method()==='POST') posts.push(JSON.parse(r.postData()||'{}').body); };
  page.on('request', onReq);
  await page.locator('button[aria-label="Send"]').first().click();
  await page.waitForTimeout(3000);
  page.off('request', onReq);
  out.v19_post=posts;
  out.v19_rendered=await page.evaluate(()=>{
    const e=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(x=>/QA-S2-V19/.test(x.innerText||''));
    return e? (e.innerText||'').replace(/\s+/g,' ').slice(-40):'absent';});

  // --- BUG-25: silent delete failure
  await empty(page, comp);
  const delId=await page.evaluate(async(ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-S2-V25 target', idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, ch);
  await page.waitForTimeout(3000);
  let aborted=0;
  await page.route('**/messaging/channels/**', r=>{ if(r.request().method()==='DELETE'){aborted++; return r.abort('failed');} return r.continue(); });
  const el=page.locator(`[data-message-id="${delId}"]`).first();
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(500);
  await el.locator('button[aria-label="More actions"]').first().click({force:true});
  await page.waitForTimeout(800);
  await page.locator('[role="menu"]').getByText('Delete',{exact:true}).first().click();
  await page.waitForTimeout(1300);
  await page.locator('[role="dialog"] button, [role="alertdialog"] button').filter({hasText:/^Delete$/}).first().click();
  const s=[]; for(let i=0;i<12;i++){ await page.waitForTimeout(500);
    s.push(await page.evaluate((id)=>{
      const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
      return {present:!!document.querySelector(`[data-message-id="${id}"]`),
        dialog:!!document.querySelector('[role="dialog"],[role="alertdialog"]'),
        notices:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis)
          .map(x=>x.textContent.trim().slice(0,50))};}, delId)); }
  await page.unroute('**/messaging/channels/**');
  out.v25={aborted, everGone:s.some(x=>!x.present), dialogClosedBy:s.findIndex(x=>!x.dialog),
    notices:[...new Set(s.flatMap(x=>x.notices))], finalPresent:s.at(-1).present};
  // clean up
  await page.evaluate(async({ch,id})=>{
    await fetch(`/api/v1/messaging/channels/${ch}/messages`,{method:'DELETE',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify({message_ids:[id]})});}, {ch,id:delId});
  return out;
};
