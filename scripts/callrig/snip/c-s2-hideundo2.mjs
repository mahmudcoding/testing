export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const tag='QA-HIDEUNDO2-'+Math.random().toString(36).slice(2,5);
  const seed=await page.evaluate(async ({ch,tag})=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({channel_id:ch, body:tag})});
    const j=await r.json(); return j.id||j.message?.id;},{ch,tag});
  await page.waitForTimeout(2000);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const out={tag};
  const msg=page.locator(`[data-message-id="${seed}"]`).first();
  await msg.scrollIntoViewIfNeeded().catch(()=>{});
  await msg.hover(); await page.waitForTimeout(1500);
  await msg.locator('button[aria-label="More actions"]').first().click({timeout:6000});
  await page.waitForTimeout(2500);
  await page.locator('[role="menu"] [role="menuitem"], [role="menu"] button')
    .filter({hasText:/^Hide for me$/}).first().click({timeout:6000});
  await page.waitForTimeout(1200);              // look immediately
  out.hiddenNow=await page.evaluate((id)=>!document.querySelector(`[data-message-id="${id}"]`), seed);
  out.undoCandidates=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('button,[role="button"],a')].filter(v)
      .filter(b=>/^undo$/i.test((b.innerText||b.getAttribute('aria-label')||'').trim()))
      .map(b=>({tag:b.tagName, aria:b.getAttribute('aria-label')||'',
        inStatus:!!b.closest('[role="status"],[role="alert"]'),
        y:Math.round(b.getBoundingClientRect().top)}));});
  if(out.undoCandidates.length){
    await page.locator('button,[role="button"]').filter({hasText:/^Undo$/}).first()
      .click({timeout:5000}).catch(()=>{out.undoClickFail=true});
    await page.waitForTimeout(5000);
    out.backAfterUndo=await page.evaluate((id)=>!!document.querySelector(`[data-message-id="${id}"]`), seed);
  }
  return out;
};
