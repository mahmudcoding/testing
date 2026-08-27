export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const seed=await page.evaluate(async (ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-EDITFAIL base'})});
    const j=await r.json(); return j.id||j.message?.id;}, ch);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(11000);
  const msg=page.locator(`[data-message-id="${seed}"]`).first();
  await msg.scrollIntoViewIfNeeded().catch(()=>{});
  await msg.hover();
  await page.waitForTimeout(1200);
  const out={seed:seed.slice(-5)};
  await page.locator('button[aria-label="More actions"]').last().click({timeout:6000}).catch(()=>{out.moreFail=true});
  await page.waitForTimeout(2500);
  out.menu=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const m=[...document.querySelectorAll('[role="menu"]')].filter(v)[0];
    return m?[...new Set([...m.querySelectorAll('[role="menuitem"],button')].filter(v)
      .map(b=>(b.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean))]:'NO-MENU';});
  await page.locator('[role="menuitem"],button').filter({hasText:/^Edit$/}).first()
    .click({timeout:6000}).catch(()=>{out.editFail=true});
  await page.waitForTimeout(3000);
  const box=page.locator('div[contenteditable="true"]').last();
  await box.click();
  await page.keyboard.press('Meta+A');
  await page.keyboard.type('QA-EDITFAIL edited-text');
  await page.waitForTimeout(900);
  out.typed=await box.evaluate(e=>e.innerText.trim().slice(0,28));
  await page.route('**/api/v1/messaging/messages/**', r=>{
    if(r.request().method()==='POST'||r.request().method()==='PATCH'||r.request().method()==='PUT')
      return r.abort('failed');
    return r.continue();});
  await page.keyboard.press('Enter');
  await page.waitForTimeout(7000);
  await page.unroute('**/api/v1/messaging/messages/**');
  out.after=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const boxes=[...document.querySelectorAll('div[contenteditable="true"]')].filter(v)
      .map(c=>({label:c.getAttribute('aria-label')||'(none)', text:(c.innerText||'').trim().slice(0,28)}));
    return {editableBoxes:boxes,
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
        .map(e=>(e.innerText||'').trim().slice(0,52)).filter(Boolean).slice(0,3)};});
  return out;
};
