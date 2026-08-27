export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const src=await page.evaluate(()=>{
    const e=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(x=>/QA-T2-FWD source/.test(x.innerText||''));
    return e? e.getAttribute('data-message-id'):null;});
  if(!src) return {err:'source message not found'};
  const el=page.locator(`main [data-message-id="${src}"]`);
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(900);
  await el.locator('button[aria-label="Forward"]').first().click();
  await page.waitForTimeout(2500);
  const before=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(v)[0];
    if(!d) return null;
    return {buttons:[...d.querySelectorAll('button')].filter(v)
      .map(b=>({t:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,22),
        al:b.getAttribute('aria-label'), disabled:b.disabled===true})).slice(0,14)};});
  // select the destination, then enumerate again
  const target=page.locator('[role="dialog"] button, [role="dialog"] li').filter({hasText:/qa-c2-deep/}).first();
  const found=await target.count();
  if(found){ await target.click(); await page.waitForTimeout(1400); }
  const after=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(v)[0];
    if(!d) return null;
    return {buttons:[...d.querySelectorAll('button')].filter(v)
      .map(b=>({t:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,22),
        al:b.getAttribute('aria-label'), disabled:b.disabled===true})).slice(0,14)};});
  await page.keyboard.press('Escape');
  return {src, targetFound:found, beforeSelect:before, afterSelect:after};
};
