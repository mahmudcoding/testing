export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const tag='QA-HIDEUNDO-'+Math.random().toString(36).slice(2,5);
  const seed=await page.evaluate(async ({ch,tag})=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({channel_id:ch, body:tag})});
    const j=await r.json(); return j.id||j.message?.id;},{ch,tag});
  await page.waitForTimeout(2000);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const out={tag, id:seed.slice(-5)};
  const msg=page.locator(`[data-message-id="${seed}"]`).first();
  await msg.scrollIntoViewIfNeeded().catch(()=>{});
  await msg.hover(); await page.waitForTimeout(1500);
  await msg.locator('button[aria-label="More actions"]').first().click({timeout:6000}).catch(()=>{out.menuFail=true});
  await page.waitForTimeout(2500);
  out.menu=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const m=[...document.querySelectorAll('[role="menu"]')].filter(v)[0];
    return m?[...m.querySelectorAll('[role="menuitem"],button')].filter(v)
      .map(b=>(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,20)).filter(Boolean):'NO-MENU';});
  const hide=page.locator('[role="menu"] [role="menuitem"], [role="menu"] button')
    .filter({hasText:/^Hide for me$/}).first();
  out.hideFound=await hide.count();
  if(!out.hideFound) return out;
  // poll for the toast from before the click
  const toasts=new Set();
  const poll=(async()=>{ const t0=Date.now();
    while(Date.now()-t0<9000){
      const t=await page.evaluate(()=>{
        const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
        return [...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
          .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean);});
      t.forEach(x=>toasts.add(x.slice(0,50)));
      await page.waitForTimeout(300);}})();
  await hide.click({timeout:6000}).catch(()=>{out.hideFail=true});
  await poll;
  out.toasts=[...toasts];
  out.hiddenNow=await page.evaluate((id)=>!document.querySelector(`[data-message-id="${id}"]`), seed);
  const undo=page.locator('[role="status"] button, [role="alert"] button').filter({hasText:/^Undo$/}).first();
  out.undoFound=await undo.count();
  if(out.undoFound){
    await undo.click({timeout:6000}).catch(()=>{out.undoFail=true});
    await page.waitForTimeout(5000);
    out.backAfterUndo=await page.evaluate((id)=>!!document.querySelector(`[data-message-id="${id}"]`), seed);
  }
  return out;
};
