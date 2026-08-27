export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCPRIVATE0001`,{waitUntil:'load'});
  await page.waitForTimeout(3800);
  const c = page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  await c.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await c.type('QA-C-DELPROP-TARGET'); await page.keyboard.press('Enter');
  await page.waitForTimeout(2800);
  return {id: await page.locator('[data-message-id]').last().getAttribute('data-message-id')};
};
