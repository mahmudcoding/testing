export default async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  try{ await ctx.grantPermissions(['clipboard-read','clipboard-write'],{origin:'https://airion-cargo.store'}); }catch(e){}
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(10000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  const empty=async()=>{for(let i=0;i<8;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(220);} return false;};
  // message with TWO picked mentions
  await empty();
  await comp.click();
  for(const h of ['qa_c_bo','qa_c_ali']){
    await comp.type('@'+h,{delay:60}); await page.waitForTimeout(1900);
    const opt=page.locator('[role="option"], [role="listbox"] li').first();
    if(await opt.count()){ await opt.click(); await page.waitForTimeout(800); }
    await comp.type(' ',{delay:40});
  }
  await comp.type('QA-LOW-MULTI',{delay:35}); await page.waitForTimeout(600);
  await page.evaluate(async()=>{ try{ await navigator.clipboard.writeText('QA-SENTINEL'); }catch(e){} });
  await page.keyboard.press('Enter'); await page.waitForTimeout(5500);
  const msg=await page.evaluate(async(ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
    const m=(await r.json()).messages[0];
    const e=document.querySelector(`main [data-message-id="${m.id}"]`);
    return {id:m.id, stored:m.body, mentions:(m.mention_ids||m.mention_user_ids||[]).length,
      onScreen:e?(e.innerText||'').replace(/\s+/g,' ').slice(-52):null};}, ch);
  out.multiMention={stored:msg.stored, mentions:msg.mentions, onScreen:msg.onScreen};
  const el=page.locator(`main [data-message-id="${msg.id}"]`);
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(1000);
  const cp=el.locator('button[aria-label="Copy text"]').first();
  if(await cp.count()){ await cp.click(); await page.waitForTimeout(2000); }
  out.multiMention.clipboard=await page.evaluate(async()=>{ try{ return await navigator.clipboard.readText(); }catch(e){ return 'ERR'; } });
  await empty();
  return out;
};
