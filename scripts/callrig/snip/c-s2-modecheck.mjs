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
  out.md0=await md.first().getAttribute('aria-pressed');
  if(out.md0!=='true'){ await md.first().click(); await page.waitForTimeout(1000); }
  out.mdOn=await md.first().getAttribute('aria-pressed');
  const posts=[];
  const onReq=r=>{ if(r.url().endsWith('/api/v1/messaging/messages')&&r.method()==='POST') posts.push(JSON.parse(r.postData()||'{}')); };

  // 1. typed mention in markdown mode
  await empty(page, comp);
  await comp.type('@qa_c_bob', {delay:55}); await page.waitForTimeout(1000);
  await comp.type(' QA-S2-MDMANUAL', {delay:35}); await page.waitForTimeout(500);
  page.on('request', onReq);
  await page.keyboard.press('Meta+Enter'); await page.waitForTimeout(2500);
  page.off('request', onReq);
  out.typedMention = posts.map(p=>({body:p.body, mention_user_ids:p.mention_user_ids}));
  posts.length=0;
  // 2. picked mention in markdown mode
  await empty(page, comp);
  await comp.type('@qa_c_bob', {delay:55}); await page.waitForTimeout(1200);
  const o=page.locator('[role="option"]').filter({hasText:'qa_c_bob'});
  if(await o.count()) await o.first().click();
  await page.waitForTimeout(700);
  await comp.type('QA-S2-MDPICKED', {delay:35}); await page.waitForTimeout(400);
  page.on('request', onReq);
  await page.keyboard.press('Meta+Enter'); await page.waitForTimeout(2500);
  page.off('request', onReq);
  out.pickedMention = posts.map(p=>({body:p.body, mention_user_ids:p.mention_user_ids}));
  // 3. slash tail loss in markdown mode
  await empty(page, comp);
  await comp.type('/shrug QA-S2-MDTAIL', {delay:40}); await page.waitForTimeout(1200);
  const before=await comp.evaluate(e=>e.innerText);
  await page.keyboard.press('Enter'); await page.waitForTimeout(1500);
  out.slash={before, after: await comp.evaluate(e=>e.innerText),
    tailKept:(await comp.evaluate(e=>e.innerText)).includes('QA-S2-MDTAIL')};
  await empty(page, comp);
  const cur=await md.first().getAttribute('aria-pressed');
  if(cur==='true'){ await md.first().click(); await page.waitForTimeout(1000); }
  out.mdFinal=await md.first().getAttribute('aria-pressed');
  return out;
};
