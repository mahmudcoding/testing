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
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  const out={};
  const run=async(cmd, tail, tag)=>{
    const posts=[];
    const onReq=r=>{ if(r.url().endsWith('/api/v1/messaging/messages')&&r.method()==='POST') posts.push(JSON.parse(r.postData()||'{}').body); };
    if(!await empty(page, comp)) return {tag, err:'not empty'};
    await comp.type(cmd, {delay:60}); await page.waitForTimeout(1300);
    const o=page.locator('[role="option"]').first();
    const opt=await o.count()? (await o.innerText()).replace(/\s+/g,' ').slice(0,30):'none';
    if(await o.count()) await o.click();
    await page.waitForTimeout(800);
    const afterPick=await comp.evaluate(e=>e.innerText);
    await comp.type(tail, {delay:40}); await page.waitForTimeout(500);
    const before=await comp.evaluate(e=>e.innerText);
    page.on('request', onReq);
    await page.locator('button[aria-label="Send"]').first().click();
    await page.waitForTimeout(2500);
    page.off('request', onReq);
    const rendered=await page.evaluate((t)=>{
      const el=[...document.querySelectorAll('main [data-message-id]')].reverse()
        .find(e=>new RegExp(t).test(e.innerText||''));
      return el? (el.innerText||'').replace(/\s+/g,' ').slice(0,80):'not found';}, tag);
    return {tag, opt, afterPick, before, posts, rendered};
  };
  out.me    = await run('/me',' QA-S2-PS1 waves','QA-S2-PS1');
  out.shrug = await run('/shrug',' QA-S2-PS2','QA-S2-PS2');
  await empty(page, comp);
  return out;
};
