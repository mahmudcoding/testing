export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, {waitUntil:'load'});
  await page.waitForTimeout(4000);
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await comp.type('QA-C-UNREAD-TRIGGER');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2500);
  const m = page.locator('[data-message-id]').last();
  return {id: await m.getAttribute('data-message-id'), text:(await m.innerText()).replace(/\s+/g,' ').slice(0,70)};
};
