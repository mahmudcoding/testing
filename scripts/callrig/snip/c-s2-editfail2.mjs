export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const seed=await page.evaluate(async (ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-EDITFAIL2 base'})});
    const j=await r.json(); return j.id||j.message?.id;}, ch);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const out={seed:seed.slice(-5)};
  const msg=page.locator(`[data-message-id="${seed}"]`).first();
  await msg.scrollIntoViewIfNeeded().catch(()=>{});
  await msg.hover();
  await page.waitForTimeout(1500);
  const more=msg.locator('button[aria-label="More actions"]').first();
  out.moreCount=await more.count();
  try { await more.click({timeout:6000}); out.moreClick='ok'; } catch(e){ out.moreClick='FAIL'; return out; }
  await page.waitForTimeout(2500);
  out.menu=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const m=[...document.querySelectorAll('[role="menu"]')].filter(v)[0];
    return m?[...new Set([...m.querySelectorAll('[role="menuitem"],button')].filter(v)
      .map(b=>(b.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean))]:'NO-MENU';});
  try { await page.locator('[role="menu"] [role="menuitem"], [role="menu"] button')
          .filter({hasText:/^Edit$/}).first().click({timeout:6000}); out.editClick='ok'; }
  catch(e){ out.editClick='FAIL'; return out; }
  await page.waitForTimeout(3000);
  const box=msg.locator('div[contenteditable="true"]').first();
  out.editBox=await box.count();
  if(!out.editBox) return out;
  await box.click();
  await page.keyboard.press('Meta+A');
  await page.keyboard.type('QA-EDITFAIL2 edited');
  await page.waitForTimeout(900);
  out.typed=await box.evaluate(e=>e.innerText.trim().slice(0,26));
  await page.route('**/api/v1/messaging/messages/**', r=>{
    const m=r.request().method();
    return (m==='PATCH'||m==='PUT'||m==='POST') ? r.abort('failed') : r.continue();});
  await page.keyboard.press('Enter');
  await page.waitForTimeout(7000);
  await page.unroute('**/api/v1/messaging/messages/**');
  out.after=await page.evaluate((id)=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const el=document.querySelector(`[data-message-id="${id}"]`);
    const inner=el?[...el.querySelectorAll('div[contenteditable="true"]')].filter(v)
      .map(c=>(c.innerText||'').trim().slice(0,26)):[];
    return {stillEditing:inner.length>0, editBoxText:inner[0]||null,
      messageText:el?(el.innerText||'').replace(/\s+/g,' ').trim().slice(-40):'gone',
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
        .map(e=>(e.innerText||'').trim().slice(0,50)).filter(Boolean).slice(0,3)};}, seed);
  return out;
};
