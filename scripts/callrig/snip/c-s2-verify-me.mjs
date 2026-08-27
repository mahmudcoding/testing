export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  const comp=()=>page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  const empty=async()=>{const c=comp(); for(let i=0;i<8;i++){ if((await c.evaluate(e=>e.innerText.trim()))==='') return true;
    await c.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(220);} return false;};
  const newest=()=>page.evaluate(async(ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[])[0]; return {id:m.id, body:m.body};}, ch);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  await empty();
  await comp().type('/me',{delay:60}); await page.waitForTimeout(1900);
  await page.getByText(/Send action message/).first().click();
  await page.waitForTimeout(1200);
  out.composerAfterPick=await comp().evaluate(e=>e.innerText.trim().slice(0,20));
  await comp().click(); await page.keyboard.press('End');
  await comp().type(' QA-V2-ME waves',{delay:40}); await page.waitForTimeout(700);
  out.composerBeforeSend=await comp().evaluate(e=>e.innerText.trim().slice(0,30));
  const before=await newest();
  // enumerate what can send, then use the Send button as the finding's steps say
  out.sendControls=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const c=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    let box=c; for(let i=0;i<5&&box.parentElement;i++) box=box.parentElement;
    return [...box.querySelectorAll('button')].filter(v)
      .map(b=>({al:b.getAttribute('aria-label'), disabled:b.disabled===true}))
      .filter(x=>x.al&&/send/i.test(x.al));});
  const send=page.locator('button[aria-label="Send message"], button[aria-label="Send"]').first();
  out.sendBtnCount=await send.count();
  if(out.sendBtnCount) await send.click(); else await page.keyboard.press('Enter');
  await page.waitForTimeout(4500);
  const after=await newest();
  out.sent = after.id!==before.id;
  out.storedBody = out.sent? after.body : '(not sent)';
  out.rendered = await page.evaluate((id)=>{const e=document.querySelector(`main [data-message-id="${id}"]`);
    return e?(e.innerText||'').replace(/\s+/g,' ').slice(-34):null;}, after.id);
  out.PASS = out.composerAfterPick==='/me' && out.sent && /\/me/.test(out.storedBody||'');
  await empty();
  return out;
};
