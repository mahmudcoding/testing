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
  await page.locator('input[type=file]').first().setInputFiles(`${DIR}/qa-s2-v3.png`);
  await page.waitForTimeout(3500);
  await comp.click(); await comp.type('QA-S2-FWDIMG only-image', {delay:30}); await page.waitForTimeout(400);
  await page.keyboard.press('Enter'); await page.waitForTimeout(8000);
  const el=page.locator('main [data-message-id]').filter({hasText:'QA-S2-FWDIMG'}).last();
  out.srcImgs=await el.evaluate(e=>e.querySelectorAll('img').length);
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(500);
  await el.locator('button[aria-label="Forward"]').first().click();
  await page.waitForTimeout(2200);
  await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role="dialog"]')].find(x=>x.getBoundingClientRect().height>30);
    const cand=[...d.querySelectorAll('button,[role="option"],li')]
      .filter(e=>/qa-general/.test((e.textContent||'')) && e.getBoundingClientRect().height>10);
    cand[cand.length-1].setAttribute('data-qa-dest','1');});
  await page.locator('[data-qa-dest="1"]').click(); await page.waitForTimeout(1200);
  await page.locator('[role="dialog"] button').filter({hasText:/^Continue$/}).first().click();
  await page.waitForTimeout(2000);
  await page.locator('[role="dialog"] button').filter({hasText:/^(Forward|Send)$/}).first().click();
  await page.waitForTimeout(4500);
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${dst}`);
  const s=[];
  for(let i=0;i<14;i++){ await page.waitForTimeout(700);
    s.push(await page.evaluate(()=>{
      const e=[...document.querySelectorAll('main [data-message-id]')].reverse()
        .find(x=>/QA-S2-FWDIMG/.test(x.innerText||''));
      if(!e) return {present:false};
      return {present:true, imgs:e.querySelectorAll('img').length,
        btns:[...e.querySelectorAll('button')].map(b=>b.getAttribute('aria-label')).filter(Boolean).slice(0,8),
        text:(e.innerText||'').replace(/\s+/g,' ').slice(0,80)};}));
  }
  out.dstSettled=s.at(-1);
  out.dstEverImg=s.some(x=>x.imgs>0);
  return out;
};
