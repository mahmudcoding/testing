export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const seed=await page.evaluate(async (ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({channel_id:ch,body:'QA-SAVEDRM probe'})});
    const j=await r.json(); return j.id||j.message?.id;}, ch);
  await page.waitForTimeout(2500);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const msg=page.locator(`[data-message-id="${seed}"]`).first();
  await msg.scrollIntoViewIfNeeded().catch(()=>{});
  await msg.hover(); await page.waitForTimeout(1500);
  await msg.locator('button[aria-label="Save"]').first().click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(4000);
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`);
  await page.waitForTimeout(12000);
  const row=page.locator('main [data-message-id]').filter({hasText:'QA-SAVEDRM'}).last();
  out.inSaved=await row.count();
  if(!out.inSaved) return out;
  await row.scrollIntoViewIfNeeded().catch(()=>{});
  await row.hover(); await page.waitForTimeout(1500);
  out.rowButtons=await row.evaluate(e=>{
    const v=(x)=>{const r=x.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...new Set([...e.querySelectorAll('button')].filter(v)
      .map(b=>(b.getAttribute('aria-label')||b.innerText||'(unnamed)').replace(/\s+/g,' ').trim().slice(0,24)))];});
  await row.locator('button[aria-label="More actions"]').first().click({timeout:6000}).catch(()=>{out.menuFail=true});
  await page.waitForTimeout(2500);
  out.menu=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const m=[...document.querySelectorAll('[role="menu"]')].filter(v)[0];
    return m?[...m.querySelectorAll('[role="menuitem"],button')].filter(v)
      .map(b=>(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,20)).filter(Boolean):'NO-MENU';});
  const del=page.locator('[role="menu"] [role="menuitem"], [role="menu"] button').filter({hasText:/^Delete$/}).first();
  if(await del.count()){ await del.click({timeout:6000}).catch(()=>{}); await page.waitForTimeout(3000); }
  out.confirm=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(v)[0];
    return d?(d.innerText||'').replace(/\s+/g,' ').trim().slice(0,160):'no dialog';});
  await page.keyboard.press('Escape').catch(()=>{});
  return out;
};
