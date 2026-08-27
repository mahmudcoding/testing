export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={cases:[]};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(10000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  const empty=async()=>{for(let i=0;i<8;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(220);} return false;};
  const send=async(text, tag)=>{
    await empty();
    await comp.click(); await comp.type(text+' '+tag,{delay:40}); await page.waitForTimeout(900);
    await page.keyboard.press('Enter'); await page.waitForTimeout(5000);
    return page.evaluate(async({ch,tag})=>{
      const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
      const m=(await r.json()).messages[0];
      const e=document.querySelector(`main [data-message-id="${m.id}"]`);
      const chip=e? e.querySelector('[data-mention-user-id]') : null;
      return {stored:(m.body||'').slice(0,40),
        mentionIds:(m.mention_ids||m.mention_user_ids||[]).length,
        rendersChip:!!chip, chipText:chip?(chip.innerText||'').trim():null};},{ch,tag});
  };
  out.cases.push({label:'existing handle, typed', ...await send('@qa_c_bob','QA-MV-1')});
  out.cases.push({label:'nonexistent handle',     ...await send('@no_such_person_xyz','QA-MV-2')});
  out.cases.push({label:'wrong case of a real handle', ...await send('@QA_C_BOB','QA-MV-3')});
  out.cases.push({label:'partial handle',         ...await send('@qa_c_bo','QA-MV-4')});
  await empty();
  return out;
};
