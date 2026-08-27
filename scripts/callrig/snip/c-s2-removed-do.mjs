const WS='W4QCF1XTURESO01', CH='C4OWKQTPC7FZ35V';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(7000);
  await page.locator('button[aria-label$="members"], button[aria-label$="member"]').last().click({timeout:8000});
  await page.waitForTimeout(2200);
  await page.locator('button[aria-label="Remove QA Bob"]').first().click({timeout:8000});
  await page.waitForTimeout(1500);
  await page.locator('[role="dialog"] button:visible').filter({hasText:/^Remove$/}).last().click({timeout:8000});
  await page.waitForTimeout(4000);
  return await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/channels/${ch}/members`,{credentials:'include'});
    const j=await r.json(); const l=(j.members||j.data||[]);
    return {members:l.length, ids:l.map(m=>m.user_id)};
  }, CH);
};
