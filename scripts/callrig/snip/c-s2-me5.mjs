const emptyComposer = async (page, comp) => {
  for (let i=0;i<8;i++){
    const t=await comp.evaluate(e=>e.innerText.replace(/​/g,'').trim());
    if (t==='') return {ok:true, tries:i};
    await comp.click();
    await page.keyboard.press('Meta+A');       // macOS select-all; Control+A only moves the caret
    await page.keyboard.press('Delete');
    await page.waitForTimeout(250);
  }
  return {ok:false, left: await comp.evaluate(e=>e.innerText.slice(0,50))};
};
export default async ({page}) => {
  const out={};
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  const posts=[];
  const onReq=r=>{ if(r.url().endsWith('/api/v1/messaging/messages')&&r.method()==='POST') posts.push(JSON.parse(r.postData()||'{}').body); };

  out.clear=await emptyComposer(page, comp);
  if(!out.clear.ok) return out;
  await comp.type('/me QA-S2-ME6 nods', {delay:45}); await page.waitForTimeout(1300);
  out.beforeSend = await comp.evaluate(e=>e.innerText);
  page.on('request', onReq);
  await page.locator('button[aria-label="Send"]').first().click();
  await page.waitForTimeout(2500);
  page.off('request', onReq);
  out.afterSend = {comp: await comp.evaluate(e=>e.innerText.replace(/\n/g,'\\n')), posts:[...posts]};
  out.rendered = await page.evaluate(()=>{
    const el=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(e=>/QA-S2-ME6/.test(e.innerText||''));
    return el? {t:(el.innerText||'').replace(/\s+/g,' ').slice(0,80), em:el.querySelectorAll('em,i').length}:'not found';
  });
  out.clearEnd=await emptyComposer(page, comp);
  return out;
};
