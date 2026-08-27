const WS='W4QCF1XTURESO01', DM='C4OVEWOTJW1AA86';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/d/${DM}`,{waitUntil:'load'});
  await page.waitForTimeout(5000);
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  for (const t of ['QA-S2-DM-KEEP-1','QA-S2-DM-KEEP-2']) {
    await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.keyboard.type(t); await page.keyboard.press('Enter'); await page.waitForTimeout(2200);
  }
  return await page.evaluate(async (dm)=>{
    const r=await fetch(`/api/v1/messaging/channels/${dm}/messages?limit=20`,{credentials:'include'});
    const j=await r.json(); const list=(j.messages||j.data||[]);
    return {count:list.length, bodies:list.map(m=>m.body).slice(0,8),
      domCount: document.querySelectorAll('[data-message-id]').length};
  }, DM);
};
