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
  await page.waitForTimeout(7000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  const md=page.locator('button[aria-label="Markdown formatting"]');
  out.mdState0=await md.first().getAttribute('aria-pressed');
  if(out.mdState0!=='true'){ await md.first().click(); await page.waitForTimeout(1000); }
  out.mdOn=await md.first().getAttribute('aria-pressed');
  // pick /me from the menu, then Send button
  if(!await empty(page, comp)) return {...out, err:'not empty'};
  await comp.type('/me', {delay:60}); await page.waitForTimeout(1300);
  const o=page.locator('[role="option"]').first();
  out.opt=await o.count()? (await o.innerText()).replace(/\s+/g,' ').slice(0,28):'none';
  if(await o.count()) await o.click();
  await page.waitForTimeout(900);
  out.afterPick=await comp.evaluate(e=>e.innerText);
  await comp.type(' QA-S2-MEMD3 shrugs', {delay:40}); await page.waitForTimeout(400);
  out.beforeSend=await comp.evaluate(e=>e.innerText);
  const posts=[];
  const onReq=r=>{ if(r.url().endsWith('/api/v1/messaging/messages')&&r.method()==='POST') posts.push(JSON.parse(r.postData()||'{}').body); };
  page.on('request', onReq);
  await page.locator('button[aria-label="Send"]').first().click();
  await page.waitForTimeout(3000);
  page.off('request', onReq);
  out.posts=posts;
  out.rendered=await page.evaluate(()=>{
    const el=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(e=>/QA-S2-MEMD3/.test(e.innerText||''));
    return el? {t:(el.innerText||'').replace(/\s+/g,' ').slice(0,60), em:el.querySelectorAll('em,i').length}:'not found';});
  // restore markdown OFF
  await empty(page, comp);
  const cur=await md.first().getAttribute('aria-pressed');
  if(cur==='true'){ await md.first().click(); await page.waitForTimeout(1000); }
  out.mdFinal=await md.first().getAttribute('aria-pressed');
  return out;
};
