export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  const empty=async()=>{for(let i=0;i<8;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(220);} return false;};
  const send=async(handle, tail)=>{
    await empty();
    await comp.click(); await comp.type('@'+handle,{delay:70}); await page.waitForTimeout(2000);
    // pick from the suggestion list
    const opt=page.locator('[role="option"], [role="listbox"] li').first();
    const picked=await opt.count();
    if(picked){ await opt.click(); await page.waitForTimeout(900); }
    await comp.type(' '+tail,{delay:40}); await page.waitForTimeout(600);
    const before=await page.evaluate(async(ch)=>{
      const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
      return (await r.json()).messages[0].id;}, ch);
    await page.keyboard.press('Enter'); await page.waitForTimeout(5000);
    return page.evaluate(async({ch,before,picked})=>{
      const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
      const m=(await r.json()).messages[0];
      return {pickedFromList:!!picked, sent:m.id!==before, body:(m.body||'').slice(0,34),
        mentionIds:(m.mention_ids||m.mention_user_ids||[]).length,
        mentionAll:m.mention_all, mentionHere:m.mention_here};},{ch,before,picked});
  };
  out.atAll  = await send('all',  'QA-V3-ALL check');
  out.atHere = await send('here', 'QA-V3-HERE check');
  out.control= await send('qa_c_bob', 'QA-V3-DIRECT check');
  await empty();
  return out;
};
