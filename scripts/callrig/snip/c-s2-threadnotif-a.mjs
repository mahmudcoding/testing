const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.type('QA-S2-TNOTIF-PARENT'); await page.keyboard.press('Enter'); await page.waitForTimeout(3200);
  const id = await page.locator('[data-message-id]').last().getAttribute('data-message-id');
  const base = await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/notifications?limit=5',{credentials:'include'});
    const j=await r.json(); return {total:j.total, unread:j.unread_count};
  });
  return {parentId:id, aliceBaseline:base};
};
