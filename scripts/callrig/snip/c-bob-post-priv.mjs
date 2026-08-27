export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCPRIVATE0001`,{waitUntil:'load'});
  await page.waitForTimeout(3500);
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await comp.type('QA-C-UNREAD-NEVERMUTED');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2200);
  return {id: await page.locator('[data-message-id]').last().getAttribute('data-message-id')};
};
