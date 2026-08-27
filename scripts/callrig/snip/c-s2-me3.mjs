const emptyComposer = async (page, comp) => {
  for (let i=0;i<12;i++){
    const t=await comp.evaluate(e=>e.innerText.replace(/​/g,'').trim());
    if (t==='') return {ok:true, tries:i};
    await comp.click();
    await page.keyboard.press('End');
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Delete');
    await page.waitForTimeout(250);
  }
  return {ok:false, left: await comp.evaluate(e=>e.innerText.slice(0,40))};
};
export default async ({page}) => {
  const out={};
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  out.clear = await emptyComposer(page, comp);
  if(!out.clear.ok) return out;
  const posts=[];
  const onReq=r=>{ if(r.url().endsWith('/api/v1/messaging/messages')&&r.method()==='POST') posts.push(JSON.parse(r.postData()||'{}').body); };
  page.on('request', onReq);
  await comp.type('/me QA-S2-ME3 waves', {delay:50});
  await page.waitForTimeout(1400);
  out.typed = await comp.evaluate(e=>e.innerText);
  await page.keyboard.press('Enter'); await page.waitForTimeout(1500);
  out.afterEnter1 = {comp: await comp.evaluate(e=>e.innerText), posts:[...posts]};
  await page.keyboard.press('Enter'); await page.waitForTimeout(2500);
  out.afterEnter2 = {comp: await comp.evaluate(e=>e.innerText.replace(/\n/g,'\\n')), posts:[...posts]};
  page.off('request', onReq);
  out.rendered = await page.evaluate(()=>{
    const el=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(e=>/QA-S2-ME3/.test(e.innerText||''));
    if(!el) return 'not found';
    const author=el.querySelector('[class*="author"],button[aria-label^="Open"]');
    return {full:(el.innerText||'').replace(/\s+/g,' ').slice(0,90),
      em:el.querySelectorAll('em,i').length, strong:el.querySelectorAll('strong,b').length,
      cls:String(el.className||'').slice(0,60)};
  });
  return out;
};
