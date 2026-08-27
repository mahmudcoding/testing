export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`,{waitUntil:'load'});
  await page.waitForTimeout(3800);
  const c = page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  await c.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.waitForTimeout(1200);
  await page.reload({waitUntil:'load'}); await page.waitForTimeout(3800);
  return await page.evaluate(()=>{const x=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    return {composer: JSON.stringify(x?x.innerText:'NONE')};});
};
