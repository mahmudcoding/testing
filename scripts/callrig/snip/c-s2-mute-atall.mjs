const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  for (const c of '@all') { await page.keyboard.type(c); await page.waitForTimeout(300); }
  await page.waitForTimeout(1300); await page.keyboard.press('Enter'); await page.waitForTimeout(800);
  await page.keyboard.type(' QA-S2-MUTE-ATALL');
  await page.keyboard.press('Enter'); await page.waitForTimeout(3500);
  return {sent:true};
};
