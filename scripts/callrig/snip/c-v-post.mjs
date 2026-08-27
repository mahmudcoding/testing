export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const ch = process.env.CH || 'C4QCGENERAL0001';
  const TAG = process.env.TAG || 'QA-VER-UNREAD-1';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, {waitUntil:'load'});
  await page.waitForTimeout(4000);
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  await comp.click(); await page.keyboard.press('Control+A'); await page.keyboard.press('Delete');
  await comp.type(TAG); await page.keyboard.press('Enter');
  await page.waitForTimeout(2500);
  const last = await page.evaluate(()=>{const m=[...document.querySelectorAll('[data-message-id]')].pop();
    return {id:m?.getAttribute('data-message-id'), t:(m?.innerText||'').replace(/\s+/g,' ').slice(0,60)};});
  return {channel:ch, tag:TAG, posted:last, at:new Date().toISOString()};
};
