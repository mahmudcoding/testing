const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(5000);
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  const ids=[];
  for (const t of ['QA-S2-UNREAD-1','QA-S2-UNREAD-2','QA-S2-UNREAD-3']) {
    await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.keyboard.type(t); await page.keyboard.press('Enter'); await page.waitForTimeout(2200);
    ids.push(await page.locator('[data-message-id]').last().getAttribute('data-message-id'));
  }
  return {ids};
};
