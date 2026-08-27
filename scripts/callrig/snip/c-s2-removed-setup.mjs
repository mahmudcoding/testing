const WS='W4QCF1XTURESO01', CH='C4OWKQTPC7FZ35V';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(7500);
  const out={};
  await page.locator('button[aria-label$="members"], button[aria-label$="member"]').last().click({timeout:8000});
  await page.waitForTimeout(2200);
  const b = page.locator('[role="dialog"] button').filter({hasText:/QA Bob/}).first();
  if (await b.count()) { await b.click({timeout:6000}); await page.waitForTimeout(800);
    const add=page.locator('[role="dialog"] button').filter({hasText:/^Add selected/}).first();
    if (await add.count() && !(await add.isDisabled())) { await add.click({timeout:6000}); await page.waitForTimeout(3000); } }
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  // post something so the channel has content
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.type('QA-S2-REMOVE-CONTENT'); await page.keyboard.press('Enter'); await page.waitForTimeout(2800);
  out.state = await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/channels/${ch}/members`,{credentials:'include'});
    const j=await r.json(); const l=(j.members||j.data||[]);
    return {members:l.length, ids:l.map(m=>m.user_id)};
  }, CH);
  return out;
};
