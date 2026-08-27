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
  await page.waitForTimeout(8000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  // BUG about typed mention
  await empty(page, comp);
  await comp.type('@qa_c_bob', {delay:50}); await page.waitForTimeout(1000);
  await comp.type(' QA-S2-SPOT1', {delay:30}); await page.waitForTimeout(400);
  const posts=[];
  const onReq=r=>{ if(r.url().endsWith('/api/v1/messaging/messages')&&r.method()==='POST') posts.push(JSON.parse(r.postData()||'{}')); };
  page.on('request', onReq);
  await page.keyboard.press('Enter'); await page.waitForTimeout(2800);
  page.off('request', onReq);
  out.typedMention={body:posts[0]&&posts[0].body, hasIds:!!(posts[0]&&posts[0].mention_user_ids)};
  out.rendersAsChip=await page.evaluate(()=>{
    const e=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(x=>/QA-S2-SPOT1/.test(x.innerText||''));
    const b=e&&e.querySelector('button[data-mention-user-id]');
    return {chip:!!b, label:b&&b.textContent.trim()};});
  // BUG about /me from the menu
  await empty(page, comp);
  await comp.type('/me', {delay:55}); await page.waitForTimeout(1200);
  const o=page.locator('[role="option"]').first();
  if(await o.count()) await o.click();
  await page.waitForTimeout(700);
  out.meAfterPick=await comp.evaluate(e=>e.innerText);
  await empty(page, comp);
  return out;
};
