const empty = async (page, comp) => {
  for (let i=0;i<8;i++){
    if ((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);
  }
  return false;
};
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(6000);
  // pick a short recent message and open its thread
  const target=page.locator('main [data-message-id]').last();
  out.targetFound=await target.count();
  if(!out.targetFound) return out;
  out.targetText=(await target.innerText()).replace(/\s+/g,' ').slice(0,50);
  out.parentId=await target.getAttribute('data-message-id');
  await target.scrollIntoViewIfNeeded(); await target.hover(); await page.waitForTimeout(400);
  await target.locator('button[aria-label="Reply"]').first().click();
  await page.waitForTimeout(3000);
  out.panelOpen = await page.evaluate(()=>{
    const c=[...document.querySelectorAll('div[contenteditable="true"]')]
      .map(e=>e.getAttribute('aria-label'));
    return {composers:c, url:location.href.slice(-60)};
  });
  // the thread composer
  const tcomp=page.locator('div[contenteditable="true"]').filter({hasNot:page.locator('nonexistent')}).last();
  const label=await tcomp.getAttribute('aria-label');
  out.threadComposerLabel=label;
  if(!await empty(page, tcomp)) return {...out, err:'thread composer not empty'};
  await tcomp.type('@qa_c_bob', {delay:55}); await page.waitForTimeout(1200);
  const opt=page.locator('[role="option"]').filter({hasText:'qa_c_bob'});
  out.pickerRows=await opt.count();
  if(await opt.count()) await opt.first().click();
  await page.waitForTimeout(700);
  await tcomp.type('QA-S2-THREADMENT', {delay:35}); await page.waitForTimeout(400);
  const posts=[];
  const onReq=r=>{ if(/\/api\/v1\/messaging\/(messages|.*reply)/.test(r.url())&&r.method()==='POST')
    posts.push({u:r.url().split('/api/v1')[1].slice(0,50), body:(r.postData()||'').slice(0,150)}); };
  page.on('request', onReq);
  await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  page.off('request', onReq);
  out.posts=posts;
  return out;
};
