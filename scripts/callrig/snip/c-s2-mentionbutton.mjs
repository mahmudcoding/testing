export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(10000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  for(let i=0;i<8;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(220); }
  const btn=page.locator('button[aria-label="Mention someone"]').first();
  out.buttonFound=await btn.count();
  if(!out.buttonFound) return out;
  await btn.click(); await page.waitForTimeout(2200);
  out.afterButton=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const c=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    const opts=[...document.querySelectorAll('[role="option"],[role="listbox"] li')].filter(v)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,30));
    return {composer:c?c.innerText.trim().slice(0,30):null, suggestions:opts.slice(0,4),
      listNodes:c?c.querySelectorAll('ul,ol,li').length:null};});
  // click the first suggestion
  const opt=page.locator('[role="option"], [role="listbox"] li').first();
  out.optionFound=await opt.count();
  if(out.optionFound){ out.optionText=(await opt.innerText()).replace(/\s+/g,' ').slice(0,30);
    await opt.click(); await page.waitForTimeout(1800); }
  out.afterPick=await page.evaluate(()=>{
    const c=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    return {composer:c?c.innerText.replace(/\s+/g,' ').trim().slice(0,40):null,
      listNodes:c?c.querySelectorAll('ul,ol,li').length:null,
      mentionChips:c?c.querySelectorAll('[data-mention-user-id],[data-lexical-mention]').length:null};});
  // send it and see what the server gets
  await comp.click(); await comp.type(' QA-MB-CHECK',{delay:35}); await page.waitForTimeout(500);
  const before=await page.evaluate(async(ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
    return (await r.json()).messages[0].id;}, ch);
  await page.keyboard.press('Enter'); await page.waitForTimeout(5000);
  out.sent=await page.evaluate(async({ch,before})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
    const m=(await r.json()).messages[0];
    return {isNew:m.id!==before, body:(m.body||'').slice(0,44),
      mentions:(m.mention_ids||m.mention_user_ids||[]).length};},{ch,before});
  for(let i=0;i<6;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(220); }
  return out;
};
