export default async ({page}) => {
  const caught=[];
  await page.route('**/api/v1/messaging/messages', async (route)=>{
    const r=route.request();
    if (r.method()==='POST') { try{ caught.push(JSON.parse(r.postData()||'{}')); }catch(e){ caught.push({parse:String(e).slice(0,40)}); } }
    await route.continue();
  });
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  const clear=async()=>{ await comp.click(); await page.keyboard.press('End');
    for(let i=0;i<3;i++){await page.keyboard.press('Control+A');await page.keyboard.press('Backspace');await page.waitForTimeout(120);} };

  await clear();
  await comp.type('@qa_c_bob', {delay:55}); await page.waitForTimeout(900);
  await comp.type(' QA-S2-MANUAL-3', {delay:35}); await page.waitForTimeout(500);
  await page.keyboard.press('Enter'); await page.waitForTimeout(1600);

  await clear();
  await comp.type('@qa_c_bob', {delay:55}); await page.waitForTimeout(1100);
  const opt=page.locator('[role="option"]').filter({hasText:'qa_c_bob'});
  if (await opt.count()) await opt.first().click();
  await page.waitForTimeout(600);
  await comp.type('QA-S2-PICKED-3', {delay:35}); await page.waitForTimeout(400);
  await page.keyboard.press('Enter'); await page.waitForTimeout(1800);

  await page.unroute('**/api/v1/messaging/messages');
  return {posts: caught.map(p=>({body:p.body, mention_user_ids:p.mention_user_ids,
    mention_all:p.mention_all, mention_here:p.mention_here, keys:Object.keys(p)}))};
};
