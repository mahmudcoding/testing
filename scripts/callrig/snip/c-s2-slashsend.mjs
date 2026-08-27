const empty = async (page, comp) => {
  for (let i=0;i<8;i++){
    const t=await comp.evaluate(e=>e.innerText.replace(/​/g,'').trim());
    if (t==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);
  }
  return false;
};
export default async ({page}) => {
  const out={};
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  const run=async(text, how, tag)=>{
    const posts=[];
    const onReq=r=>{ if(r.url().endsWith('/api/v1/messaging/messages')&&r.method()==='POST') posts.push(JSON.parse(r.postData()||'{}').body); };
    const ok=await empty(page, comp);
    if(!ok) return {tag, err:'composer not empty'};
    await comp.type(text, {delay:45}); await page.waitForTimeout(1300);
    const before=await comp.evaluate(e=>e.innerText);
    page.on('request', onReq);
    if (how==='send') await page.locator('button[aria-label="Send"]').first().click();
    else await page.keyboard.press('Enter');
    await page.waitForTimeout(2400);
    page.off('request', onReq);
    return {tag, how, before, after:(await comp.evaluate(e=>e.innerText)).replace(/\n/g,'\\n'), posts};
  };
  out.meSend2  = await run('/me QA-S2-ME7 sighs','send','me-send');
  out.shrugSend= await run('/shrug QA-S2-SH1','send','shrug-send');
  out.shrugEnter=await run('/shrug QA-S2-SH2','enter','shrug-enter');
  await empty(page, comp);
  return out;
};
