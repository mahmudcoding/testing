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
  const out={runs:[]};
  for (const text of ['/shrug QA-S2-LOSS1 please review','/shrug tail QA-S2-LOSS2']) {
    const posts=[];
    const onReq=r=>{ if(r.url().endsWith('/api/v1/messaging/messages')&&r.method()==='POST') posts.push(JSON.parse(r.postData()||'{}').body); };
    if(!await empty(page, comp)) { out.runs.push({text, err:'not empty'}); continue; }
    await comp.type(text, {delay:45}); await page.waitForTimeout(1300);
    const before=await comp.evaluate(e=>e.innerText);
    page.on('request', onReq);
    await page.keyboard.press('Enter'); await page.waitForTimeout(1800);
    const after1=await comp.evaluate(e=>e.innerText);
    await page.keyboard.press('Enter'); await page.waitForTimeout(2200);
    page.off('request', onReq);
    out.runs.push({text, before, afterEnter1:after1,
      afterEnter2:(await comp.evaluate(e=>e.innerText)).replace(/\n/g,'\\n'), posts});
  }
  await empty(page, comp);
  return out;
};
