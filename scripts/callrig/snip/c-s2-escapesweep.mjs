const empty = async (page, comp) => {
  for (let i=0;i<8;i++){
    if ((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);
  }
  return false;
};
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', src='C4QCPRIVATE0001', dst='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${src}`);
  await page.waitForTimeout(7500);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  await empty(page, comp);
  await comp.type('QA-S2-ESCSWEEP a-b **c** _d_', {delay:30}); await page.waitForTimeout(500);
  await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  const el=page.locator('main [data-message-id]').filter({hasText:'QA-S2-ESCSWEEP'}).last();
  const id=await el.getAttribute('data-message-id');
  out.id=id;
  out.stored=await page.evaluate(async({src,id})=>{
    const j=await (await fetch(`/api/v1/messaging/channels/${src}/messages?limit=4`,{credentials:'include'})).json();
    const m=(j.messages||j.data||j||[]).find(x=>x.id===id); return m? m.body:'absent';}, {src,id});
  out.feed=await el.evaluate(e=>(e.innerText||'').replace(/\s+/g,' ').slice(-40));
  // pin it, read the pinned panel
  await page.evaluate(async({src,id})=>{
    await fetch(`/api/v1/messaging/channels/${src}/messages/${id}/pin`,{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({pin:true})});}, {src,id});
  await page.reload(); await page.waitForTimeout(7000);
  const va=page.locator('button').filter({hasText:/View all/}).first();
  if(await va.count()){ await va.click(); await page.waitForTimeout(2500);
    out.pinnedPanel=await page.evaluate(()=>{
      const d=[...document.querySelectorAll('[role="dialog"]')].find(x=>x.getBoundingClientRect().height>40)||document.querySelector('main');
      const t=(d.innerText||'').replace(/\s+/g,' ');
      const i=t.indexOf('QA-S2-ESCSWEEP');
      return i>=0? t.slice(i, i+50):'not in panel';});
    await page.keyboard.press('Escape'); await page.waitForTimeout(800); }
  // forward it, read the forwarded card
  const el2=page.locator(`[data-message-id="${id}"]`).first();
  await el2.scrollIntoViewIfNeeded(); await el2.hover(); await page.waitForTimeout(500);
  await el2.locator('button[aria-label="Forward"]').first().click();
  await page.waitForTimeout(2300);
  await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role="dialog"]')].find(x=>x.getBoundingClientRect().height>30);
    const c=[...d.querySelectorAll('button,[role="option"],li')]
      .filter(e=>/qa-general/.test((e.textContent||''))&&e.getBoundingClientRect().height>10);
    c[c.length-1].setAttribute('data-qa-dest','1');});
  await page.locator('[data-qa-dest="1"]').click(); await page.waitForTimeout(1300);
  await page.locator('[role="dialog"] button').filter({hasText:/^Continue$/}).first().click();
  await page.waitForTimeout(2000);
  await page.locator('[role="dialog"] button').filter({hasText:/^(Forward|Send)$/}).first().click();
  await page.waitForTimeout(4500);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${dst}`);
  await page.waitForTimeout(7500);
  out.forwardCard=await page.evaluate(()=>{
    const e=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(x=>/QA-S2-ESCSWEEP/.test(x.innerText||''));
    return e? (e.innerText||'').replace(/\s+/g,' ').slice(-60):'absent';});
  // notification body for the recipient side, from my own notifications API view
  await page.evaluate(async({src,id})=>{
    await fetch(`/api/v1/messaging/channels/${src}/messages/${id}/pin`,{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({pin:false})});}, {src,id});
  return out;
};
