export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(10000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  const empty=async()=>{for(let i=0;i<8;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(220);} return false;};
  const newest=()=>page.evaluate(async(ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
    const m=(await r.json()).messages[0]; return {id:m.id, body:m.body};}, ch);
  // type /me out in full, never touching the suggestion list
  await empty();
  await comp.click(); await comp.type('/me QA-METYPED waves at everyone',{delay:35});
  await page.waitForTimeout(1200);
  out.composerBeforeEnter=await comp.evaluate(e=>e.innerText.trim().slice(0,44));
  const before=await newest();
  await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  out.afterEnter1={composer:await comp.evaluate(e=>e.innerText.trim().slice(0,44)),
    sent:(await newest()).id!==before.id};
  if(!out.afterEnter1.sent){ await page.keyboard.press('Enter'); await page.waitForTimeout(4000); }
  const after=await newest();
  out.final={sent:after.id!==before.id, stored:after.body.slice(0,44)};
  out.rendered=await page.evaluate((id)=>{const e=document.querySelector(`main [data-message-id="${id}"]`);
    return e?(e.innerText||'').replace(/\s+/g,' ').slice(-46):null;}, after.id);
  await empty();
  return out;
};
