export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001', dest='C4OX0TTLIMVOUBH';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  for(let i=0;i<8;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(220); }
  // a real mention, picked from the list
  await comp.click(); await comp.type('@qa_c_bo',{delay:70}); await page.waitForTimeout(2000);
  const opt=page.locator('[role="option"], [role="listbox"] li').first();
  if(await opt.count()){ await opt.click(); await page.waitForTimeout(900); }
  await comp.type(' QA-T2-FWD source',{delay:35}); await page.waitForTimeout(500);
  await page.keyboard.press('Enter'); await page.waitForTimeout(5000);
  const src=await page.evaluate(()=>{
    const e=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(x=>/QA-T2-FWD source/.test(x.innerText||''));
    return e? {id:e.getAttribute('data-message-id'),
      rendered:(e.innerText||'').replace(/\s+/g,' ').slice(-40)}:null;});
  out.source=src;
  if(!src) return out;
  // forward it to another channel
  const el=page.locator(`main [data-message-id="${src.id}"]`);
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(900);
  await el.locator('button[aria-label="Forward"]').first().click();
  await page.waitForTimeout(2500);
  out.forwardDialog=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(v)[0];
    return d? (d.innerText||'').replace(/\s+/g,' ').slice(0,90):null;});
  const target=page.locator('[role="dialog"] button, [role="dialog"] li').filter({hasText:/qa-c2-deep/}).first();
  out.targetFound=await target.count();
  if(out.targetFound){
    await target.click(); await page.waitForTimeout(1000);
    const send=page.locator('[role="dialog"] button').filter({hasText:/^(Forward|Send|Forward message)$/}).first();
    if(await send.count()) await send.click();
    await page.waitForTimeout(5000);
  }
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${dest}`);
  await page.waitForTimeout(9000);
  out.forwarded=await page.evaluate(()=>{
    const e=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(x=>/QA-T2-FWD source/.test(x.innerText||''));
    if(!e) return null;
    const chip=e.querySelector('[data-mention-user-id]');
    return {text:(e.innerText||'').replace(/\s+/g,' ').slice(-70),
      hasMentionChip:!!chip, chipText:chip?(chip.innerText||'').trim():null,
      showsUsername:/@qa_c_bob/.test(e.innerText||''),
      showsDisplayName:/@QA Bob/.test(e.innerText||'')};});
  return out;
};
