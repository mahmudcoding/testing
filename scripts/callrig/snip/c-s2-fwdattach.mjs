const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
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
  await page.waitForTimeout(7000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  await empty(page, comp);
  await page.locator('input[type=file]').first().setInputFiles([`${DIR}/qa-s2-v2.png`, `${DIR}/qa-s2-m3.txt`]);
  await page.waitForTimeout(3500);
  await comp.click(); await comp.type('QA-S2-FWDATT source', {delay:30}); await page.waitForTimeout(400);
  await page.keyboard.press('Enter'); await page.waitForTimeout(8000);
  const el=page.locator('main [data-message-id]').filter({hasText:'QA-S2-FWDATT source'}).last();
  out.srcFound=await el.count();
  if(!out.srcFound) return out;
  out.srcId=await el.getAttribute('data-message-id');
  out.srcShape=await el.evaluate(e=>({imgs:e.querySelectorAll('img').length,
    text:(e.innerText||'').replace(/\s+/g,' ').slice(0,90),
    fileBtns:[...e.querySelectorAll('button')].map(b=>b.getAttribute('aria-label'))
      .filter(l=>l&&/Preview|Download|Open /.test(l))}));
  // forward it
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(500);
  await el.locator('button[aria-label="Forward"]').first().click();
  await page.waitForTimeout(2000);
  out.dialog=await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role="dialog"]')].find(x=>x.getBoundingClientRect().height>30);
    return d? (d.innerText||'').replace(/\s+/g,' ').slice(0,180):null;});
  const target=page.locator('[role="dialog"]').getByText('qa-general', {exact:false}).first();
  if(await target.count()){ await target.click(); await page.waitForTimeout(800); }
  const send=page.locator('[role="dialog"] button').filter({hasText:/^(Forward|Send)$/}).first();
  out.sendBtn=await send.count();
  if(out.sendBtn){ await send.click(); await page.waitForTimeout(4000); }
  else { await page.keyboard.press('Escape'); return out; }
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${dst}`);
  await page.waitForTimeout(7000);
  out.dst=await page.evaluate(()=>{
    const e=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(x=>/QA-S2-FWDATT source/.test(x.innerText||''));
    return e? {imgs:e.querySelectorAll('img').length,
      text:(e.innerText||'').replace(/\s+/g,' ').slice(0,110),
      fileBtns:[...e.querySelectorAll('button')].map(b=>b.getAttribute('aria-label'))
        .filter(l=>l&&/Preview|Download|Open /.test(l))}:'not found';});
  return out;
};
