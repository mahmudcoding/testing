export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  for(let k=0;k<6;k++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);}
  await comp.click();
  await page.keyboard.type('- QA-EDITMD3 typed dash');
  await page.waitForTimeout(900);
  await page.locator('button[aria-label="Send"]').first().click({timeout:6000});
  await page.waitForTimeout(7000);
  const out={};
  out.asSent=await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=3',{credentials:'include'});
    const j=await r.json(); const m=(j&&j.messages)||[];
    const hit=m.find(x=>/QA-EDITMD3/.test(x.body||''));
    const el=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(e=>/QA-EDITMD3/.test(e.innerText||''));
    return {id:hit?hit.id:null, storedBody:hit?hit.body:null,
      isList:el?!!el.querySelector('ul,li'):null,
      rendered:el?(el.innerText||'').replace(/\s+/g,' ').trim().slice(-40):'gone'};});
  if(!out.asSent.id) return out;
  const msg=page.locator(`[data-message-id="${out.asSent.id}"]`).first();
  await msg.scrollIntoViewIfNeeded().catch(()=>{});
  await msg.hover(); await page.waitForTimeout(1500);
  await msg.locator('button[aria-label="More actions"]').first().click({timeout:6000});
  await page.waitForTimeout(2500);
  await page.locator('[role="menu"] [role="menuitem"], [role="menu"] button')
    .filter({hasText:/^Edit$/}).first().click({timeout:6000});
  await page.waitForTimeout(3000);
  out.editorShows=await comp.evaluate(e=>e.innerText.trim().slice(0,34));
  await comp.click(); await page.keyboard.press('End'); await page.keyboard.type(' X');
  await page.waitForTimeout(800);
  const posts=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()==='PATCH')
    {try{posts.push(String(r.postData()||'').slice(0,90));}catch(e){}}};
  page.on('request',onReq);
  await page.locator('button[aria-label="Save changes"]').first().click({timeout:6000}).catch(e=>{out.saveErr='FAIL';});
  await page.waitForTimeout(7000);
  page.off('request',onReq);
  out.patchBody=posts[0]||null;
  out.afterEdit=await page.evaluate(async (id)=>{
    const r=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=3',{credentials:'include'});
    const j=await r.json(); const m=(j&&j.messages)||[];
    const hit=m.find(x=>x.id===id);
    const el=document.querySelector(`[data-message-id="${id}"]`);
    return {storedBody:hit?hit.body:null, isList:el?!!el.querySelector('ul,li'):null,
      rendered:el?(el.innerText||'').replace(/\s+/g,' ').trim().slice(-42):'gone'};}, out.asSent.id);
  return out;
};
