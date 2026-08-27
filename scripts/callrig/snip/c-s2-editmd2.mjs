export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const seed=await page.evaluate(async (ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'- QA-EDITMD2 leading dash'})});
    const j=await r.json(); return j.id||j.message?.id;}, ch);
  await page.waitForTimeout(2500);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const out={};
  const msg=page.locator(`[data-message-id="${seed}"]`).first();
  await msg.scrollIntoViewIfNeeded().catch(()=>{});
  await msg.hover(); await page.waitForTimeout(1500);
  await msg.locator('button[aria-label="More actions"]').first().click({timeout:6000});
  await page.waitForTimeout(2500);
  await page.locator('[role="menu"] [role="menuitem"], [role="menu"] button')
    .filter({hasText:/^Edit$/}).first().click({timeout:6000});
  await page.waitForTimeout(3000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  out.editorShows=await comp.evaluate(e=>e.innerText.trim().slice(0,34));
  out.saveBtnState=await page.evaluate(()=>{
    const b=document.querySelector('button[aria-label="Save changes"]');
    return b?{present:true, disabled:b.disabled, aria:b.getAttribute('aria-disabled')}:{present:false};});
  // make a real change so Save becomes actionable
  await comp.click();
  await page.keyboard.press('End');
  await page.keyboard.type(' EDITED');
  await page.waitForTimeout(900);
  out.afterTyping=await comp.evaluate(e=>e.innerText.trim().slice(0,40));
  out.saveBtnAfterChange=await page.evaluate(()=>{
    const b=document.querySelector('button[aria-label="Save changes"]');
    return b?{present:true, disabled:b.disabled}:{present:false};});
  const posts=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&['PATCH','PUT'].includes(r.method()))
    {try{posts.push(r.method()+' '+String(r.postData()||'').slice(0,80));}catch(e){}}};
  page.on('request',onReq);
  await page.evaluate(()=>{window.__c=[];document.addEventListener('click',e=>{
    const t=e.target.closest('button')||e.target;
    window.__c.push(((t.getAttribute&&t.getAttribute('aria-label'))||'').slice(0,20));},true);});
  await page.locator('button[aria-label="Save changes"]').first().click({timeout:6000}).catch(e=>{out.saveErr=String(e.message).slice(0,40);});
  await page.waitForTimeout(6000);
  page.off('request',onReq);
  out.landed=await page.evaluate(()=>window.__c);
  out.saveRequest=posts.slice(0,2);
  out.after=await page.evaluate(async (id)=>{
    const e=document.querySelector(`[data-message-id="${id}"]`);
    const r=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=5',{credentials:'include'});
    const j=await r.json(); const m=(j&&j.messages)||[];
    const hit=m.find(x=>x.id===id);
    return {isList:e?!!e.querySelector('ul,li'):null,
      rendered:e?(e.innerText||'').replace(/\s+/g,' ').trim().slice(-42):'gone',
      storedBody:hit?hit.body:null};}, seed);
  return out;
};
