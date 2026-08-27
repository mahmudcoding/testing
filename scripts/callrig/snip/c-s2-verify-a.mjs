export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  const empty=async(comp)=>{for(let i=0;i<8;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(220);} return false;};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  // ── finding #9: escaping is lost on edit
  await empty(comp);
  await comp.type('- QA-V2-ESC item', {delay:35}); await page.waitForTimeout(400);
  await page.keyboard.press('Enter'); await page.waitForTimeout(5000);
  const sent=await page.evaluate(async(ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=3`,{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[])[0];
    return {id:m.id, storedBody:m.body};}, ch);
  const listBefore=await page.evaluate((id)=>{
    const e=document.querySelector(`main [data-message-id="${id}"]`);
    return e? {li:e.querySelectorAll('ul,ol,li').length, text:(e.innerText||'').replace(/\s+/g,' ').slice(-30)}:null;}, sent.id);
  const el=page.locator(`main [data-message-id="${sent.id}"]`);
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(900);
  await el.locator('button[aria-label="More actions"]').first().click();
  await page.waitForTimeout(1300);
  await page.getByText(/^Edit$/).first().click(); await page.waitForTimeout(1800);
  await comp.click(); await page.keyboard.press('End');
  await comp.type(' Z',{delay:40}); await page.waitForTimeout(500);
  const save=page.locator('button[aria-label="Save changes"]').first();
  if(await save.count() && !(await save.isDisabled())) await save.click();
  await page.waitForTimeout(5000);
  const after=await page.evaluate(async({ch,id})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=5`,{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[]).find(x=>x.id===id);
    const e=document.querySelector(`main [data-message-id="${id}"]`);
    return {storedBody:m&&m.body, li:e?e.querySelectorAll('ul,ol,li').length:null,
      text:e?(e.innerText||'').replace(/\s+/g,' ').slice(-30):null};},{ch,id:sent.id});
  out.f9={storedOnSend:sent.storedBody, listNodesBefore:listBefore&&listBefore.li,
    storedAfterEdit:after.storedBody, listNodesAfter:after.li, textAfter:after.text,
    PASS: /\\-/.test(sent.storedBody||'') && !/\\-/.test(after.storedBody||'') && after.li>0};
  // ── finding #21: hand-typed @name is not a mention
  await empty(comp);
  await comp.type('@qa_c_bob QA-V2-MANUAL',{delay:45}); await page.waitForTimeout(900);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Enter'); await page.waitForTimeout(5000);
  out.f21=await page.evaluate(async(ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=3`,{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[])[0];
    const e=document.querySelector(`main [data-message-id="${m.id}"]`);
    const btn=e? e.querySelector('[data-mention-user-id]') : null;
    return {body:m.body, hasMentionIds: !!(m.mention_ids||m.mention_user_ids||[]).length,
      rendersAsChip: !!btn, PASS: !((m.mention_ids||m.mention_user_ids||[]).length) && !!btn};}, ch);
  await empty(comp);
  return out;
};
