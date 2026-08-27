export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  const empty=async(comp)=>{for(let i=0;i<8;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(220);} return false;};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  const newest=()=>page.evaluate(async(ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[])[0];
    return {id:m.id, body:m.body, mentions:(m.mention_ids||m.mention_user_ids||[]).length};}, ch);
  out.before=await newest();
  // hand-typed: handle, then a space, then text — never pick from the list
  await empty(comp);
  await comp.type('@qa_c_bob',{delay:60}); await page.waitForTimeout(1200);
  await comp.type(' QA-V2-MANUAL',{delay:45}); await page.waitForTimeout(900);
  out.composerBeforeSend=await comp.evaluate(e=>e.innerText.trim().slice(0,40));
  await page.keyboard.press('Enter'); await page.waitForTimeout(5500);
  out.manual=await newest();
  out.manualRender=await page.evaluate((id)=>{
    const e=document.querySelector(`main [data-message-id="${id}"]`);
    if(!e) return null;
    const b=e.querySelector('[data-mention-user-id]');
    return {chip:!!b, chipText:b?(b.innerText||'').trim():null,
      text:(e.innerText||'').replace(/\s+/g,' ').slice(-34)};}, out.manual.id);
  // control: pick from the dropdown
  await empty(comp);
  await comp.type('@qa_c_bo',{delay:70}); await page.waitForTimeout(2000);
  const opt=page.locator('[role="option"], [role="listbox"] li, [data-testid*="mention"] button').first();
  out.optionFound=await opt.count();
  if(out.optionFound){ await opt.click(); await page.waitForTimeout(900); }
  else { await page.keyboard.press('Enter'); await page.waitForTimeout(900); }
  await comp.type(' QA-V2-PICKED',{delay:45}); await page.waitForTimeout(700);
  await page.keyboard.press('Enter'); await page.waitForTimeout(5500);
  out.picked=await newest();
  out.PASS = out.manual.mentions===0 && out.picked.mentions>0 && !!(out.manualRender&&out.manualRender.chip);
  await empty(comp);
  return out;
};
