const emptyComposer = async (page, comp) => {
  for (let i=0;i<12;i++){
    const t=await comp.evaluate(e=>e.innerText.replace(/​/g,'').trim());
    if (t==='') return true;
    await comp.click(); await page.keyboard.press('End');
    await page.keyboard.press('Control+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);
  }
  return false;
};
export default async ({page}) => {
  const out={};
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  const posts=[];
  const onReq=r=>{ if(r.url().endsWith('/api/v1/messaging/messages')&&r.method()==='POST') posts.push(JSON.parse(r.postData()||'{}').body); };

  // (a) pick /me from the picker, then type, then ONE Enter
  out.clearA = await emptyComposer(page, comp);
  await comp.type('/me', {delay:60}); await page.waitForTimeout(1300);
  const o=page.locator('[role="option"]').first();
  out.optA = await o.count()? (await o.innerText()).replace(/\s+/g,' ').slice(0,30):'none';
  if(await o.count()) await o.click();
  await page.waitForTimeout(800);
  out.afterPick = await comp.evaluate(e=>e.innerText);
  await comp.type(' QA-S2-ME4 jumps', {delay:40}); await page.waitForTimeout(500);
  out.beforeEnterA = await comp.evaluate(e=>e.innerText);
  page.on('request', onReq);
  await page.keyboard.press('Enter'); await page.waitForTimeout(2000);
  out.afterEnterA = {comp: await comp.evaluate(e=>e.innerText.replace(/\n/g,'\\n')), posts:[...posts]};
  page.off('request', onReq);

  // (b) Send button instead of Enter
  posts.length=0;
  out.clearB = await emptyComposer(page, comp);
  await comp.type('/me QA-S2-ME5 nods', {delay:45}); await page.waitForTimeout(1300);
  out.beforeSendB = await comp.evaluate(e=>e.innerText);
  page.on('request', onReq);
  await page.locator('button[aria-label="Send"]').first().click();
  await page.waitForTimeout(2500);
  out.afterSendB = {comp: await comp.evaluate(e=>e.innerText.replace(/\n/g,'\\n')), posts:[...posts]};
  page.off('request', onReq);
  await emptyComposer(page, comp);
  return out;
};
