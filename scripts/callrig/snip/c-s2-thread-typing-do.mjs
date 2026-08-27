const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  const parent = page.locator('[data-message-id]').filter({hasText:'QA-S2-QMD parent'}).last();
  await parent.scrollIntoViewIfNeeded().catch(()=>{});
  await parent.hover(); await page.waitForTimeout(800);
  await parent.locator('button[aria-label="Reply"]').first().click({timeout:10000});
  await page.waitForTimeout(4000);
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  for (const c of 'TYPINGINTHREAD') { await page.keyboard.type(c); await page.waitForTimeout(250); }
  await page.waitForTimeout(4000);
  return {typed:true, url:page.url()};
};
