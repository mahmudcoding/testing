const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  if (!page.url().includes(GEN)) { await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'}); await page.waitForTimeout(5000); }
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.type('QA-S2-A11Y2 **bold** and_under');
  await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  return {id: await page.locator('[data-message-id]').last().getAttribute('data-message-id')};
};
