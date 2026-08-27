export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001', id='M4OXEWL01S5558H';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  for(let k=0;k<6;k++){
    if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);}
  const out={composerCleared:await comp.evaluate(e=>e.innerText.trim()==='')};
  const msg=page.locator(`[data-message-id="${id}"]`).first();
  await msg.scrollIntoViewIfNeeded().catch(()=>{});
  await msg.hover(); await page.waitForTimeout(1500);
  await msg.locator('button[aria-label="More actions"]').first().click({timeout:6000});
  await page.waitForTimeout(2500);
  const trig=page.locator('[role="menuitem"]').filter({hasText:/^Seen by/}).first();
  out.seenItem=await trig.count();
  if(!out.seenItem) return out;
  await trig.hover({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(3000);
  out.list=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const l=[...document.querySelectorAll('[role="menu"],[role="group"]')].filter(v)
      .find(e=>/People who saw/i.test(e.getAttribute('aria-label')||''));
    return l?{label:l.getAttribute('aria-label'), role:l.getAttribute('role'),
      rows:[...l.children].map(c=>({tag:c.tagName,
        text:(c.innerText||'').replace(/\s+/g,' ').trim().slice(0,24),
        role:c.getAttribute('role')||(c.querySelector('button')?'has button':'')}))}:'NO-LIST';});
  const row=page.locator('[aria-label="People who saw this message"] > *').first();
  if(await row.count()){
    await row.click({timeout:6000}).catch(()=>{out.rowClickFail=true});
    await page.waitForTimeout(4000);
    out.afterRowClick=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const d=[...document.querySelectorAll('[role="dialog"]')].filter(v);
      return {dialogs:d.length,
        text:d[0]?(d[0].innerText||'').replace(/\s+/g,' ').trim().slice(0,110):null};});
  }
  return out;
};
