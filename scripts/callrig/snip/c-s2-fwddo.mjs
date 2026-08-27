export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001', dest='C4OX0TTLIMVOUBH';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const src=await page.evaluate(()=>{
    const e=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(x=>/QA-T2-FWD source/.test(x.innerText||''));
    return e? e.getAttribute('data-message-id'):null;});
  if(!src) return {err:'source not found'};
  const el=page.locator(`main [data-message-id="${src}"]`);
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(900);
  await el.locator('button[aria-label="Forward"]').first().click();
  await page.waitForTimeout(2500);
  await page.locator('[role="dialog"] button').filter({hasText:/^#qa-c2-deep$/}).first().click();
  await page.waitForTimeout(1200);
  await page.locator('[role="dialog"] button').filter({hasText:/^Continue$/}).first().click();
  await page.waitForTimeout(2500);
  out.step2=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(v)[0];
    if(!d) return null;
    return {head:(d.innerText||'').replace(/\s+/g,' ').slice(0,80),
      buttons:[...d.querySelectorAll('button')].filter(v)
        .map(b=>(b.innerText||'').trim().slice(0,18)||b.getAttribute('aria-label')).filter(Boolean).slice(0,8)};});
  const go=page.locator('[role="dialog"] button').filter({hasText:/^(Forward|Send|Forward message)$/}).first();
  out.sendFound=await go.count();
  if(out.sendFound){ await go.click(); await page.waitForTimeout(5000); }
  else { await page.keyboard.press('Escape'); return out; }
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${dest}`);
  await page.waitForTimeout(9000);
  out.forwarded=await page.evaluate(()=>{
    const e=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(x=>/QA-T2-FWD source/.test(x.innerText||''));
    if(!e) return null;
    const chip=e.querySelector('[data-mention-user-id]');
    return {text:(e.innerText||'').replace(/\s+/g,' ').slice(-80),
      hasMentionChip:!!chip, chipText:chip?(chip.innerText||'').trim():null,
      showsUsername:/@qa_c_bob/.test(e.innerText||''),
      showsDisplayName:/@QA Bob/.test(e.innerText||'')};});
  return out;
};
