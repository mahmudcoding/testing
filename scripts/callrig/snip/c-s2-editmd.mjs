export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const seed=await page.evaluate(async (ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'- QA-EDITMD leading dash'})});
    const j=await r.json(); return j.id||j.message?.id;}, ch);
  await page.waitForTimeout(2500);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const out={};
  out.beforeEdit=await page.evaluate(async (id)=>{
    const e=document.querySelector(`[data-message-id="${id}"]`);
    const r=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=5',{credentials:'include'});
    const j=await r.json(); const m=(j&&j.messages)||[];
    const hit=m.find(x=>x.id===id);
    return {rendered:e?(e.innerText||'').replace(/\s+/g,' ').trim().slice(-40):'gone',
      isList:e?!!e.querySelector('ul,li'):null, storedBody:hit?hit.body:null};}, seed);
  const msg=page.locator(`[data-message-id="${seed}"]`).first();
  await msg.scrollIntoViewIfNeeded().catch(()=>{});
  await msg.hover(); await page.waitForTimeout(1500);
  await msg.locator('button[aria-label="More actions"]').first().click({timeout:6000});
  await page.waitForTimeout(2500);
  await page.locator('[role="menu"] [role="menuitem"], [role="menu"] button')
    .filter({hasText:/^Edit$/}).first().click({timeout:6000}).catch(()=>{out.editFail=true});
  await page.waitForTimeout(3000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  out.inEditor=await comp.evaluate(e=>e.innerText.trim().slice(0,34));
  // save without changing anything
  const posts=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&['PATCH','PUT','POST'].includes(r.method())&&/messages/.test(u))
    {try{posts.push(r.method()+' '+String(r.postData()||'').slice(0,90));}catch(e){}}};
  page.on('request',onReq);
  await page.locator('button[aria-label="Save changes"]').first().click({timeout:6000}).catch(()=>{out.saveFail=true});
  await page.waitForTimeout(6000);
  page.off('request',onReq);
  out.saveRequest=posts.slice(0,2);
  out.afterEdit=await page.evaluate(async (id)=>{
    const e=document.querySelector(`[data-message-id="${id}"]`);
    const r=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=5',{credentials:'include'});
    const j=await r.json(); const m=(j&&j.messages)||[];
    const hit=m.find(x=>x.id===id);
    return {rendered:e?(e.innerText||'').replace(/\s+/g,' ').trim().slice(-40):'gone',
      isList:e?!!e.querySelector('ul,li'):null, storedBody:hit?hit.body:null};}, seed);
  return out;
};
