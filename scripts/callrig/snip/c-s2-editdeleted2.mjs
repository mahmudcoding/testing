export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const tag='QA-EDITDEL2-'+Math.random().toString(36).slice(2,5);
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
    .filter({hasText:/^Edit$/}).first().click({timeout:6000}).catch(()=>{out.editFail=true});
  await page.waitForTimeout(3000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  out.inEditMode=await comp.evaluate(e=>e.innerText.trim().slice(0,22));
  await comp.click(); await page.keyboard.press('Meta+A');
  await page.keyboard.type(tag+' EDITED');
  await page.waitForTimeout(800);
  out.del=await page.evaluate(async ({ch,id})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages`,{method:'DELETE',
      credentials:'include', headers:{'content-type':'application/json'},
      body:JSON.stringify({message_ids:[id]})});
    let j=null; try{j=await r.json()}catch{}
    return {status:r.status, deleted:j&&j.deleted_ids};},{ch,id:seed});
  await page.waitForTimeout(4000);
  const toasts=new Set();
  const poll=(async()=>{const t0=Date.now();
    while(Date.now()-t0<11000){
      const t=await page.evaluate(()=>{
        const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
        return [...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
          .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean);});
      t.forEach(x=>toasts.add(x.slice(0,80)));
      await page.waitForTimeout(300);}})();
  await page.locator('button[aria-label="Save changes"]').first().click({timeout:6000}).catch(()=>{out.saveFail=true});
  await poll;
  out.toasts=[...toasts];
  out.after=await page.evaluate((id)=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const c=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    const el=document.querySelector(`[data-message-id="${id}"]`);
    return {composerText:c?(c.innerText||'').trim().slice(0,26):'none',
      stillEditing:[...document.querySelectorAll('button[aria-label]')].filter(v)
        .some(b=>b.getAttribute('aria-label')==='Save changes'),
      messageNode:el?(el.innerText||'').replace(/\s+/g,' ').trim().slice(-34):'absent'};}, seed);
  return out;
};
