// alice: post a marker in #qa-private, forward it to #qa-general
export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCPRIVATE0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  await comp.click(); await page.keyboard.press('Control+A'); await page.keyboard.press('Delete');
  await comp.type('SECRET-C-PRIVATE-42');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2500);
  const msg = page.locator('[data-message-id]').last();
  const srcId = await msg.getAttribute('data-message-id');
  await msg.hover(); await page.waitForTimeout(700);
  await page.locator('button[aria-label="Forward"]').last().click();
  await page.waitForTimeout(1800);
  const dlg = page.locator('[role=dialog]').last();
  const pickerText = (await dlg.innerText()).slice(0,400);
  await dlg.locator('button', {hasText:'#qa-general'}).first().click();
  await page.waitForTimeout(500);
  await dlg.locator('button', {hasText:'Continue'}).first().click();
  await page.waitForTimeout(1500);
  const d2 = page.locator('[role=dialog]').last();
  await d2.locator('button', {hasText:/^Send$/}).first().click();
  await page.waitForTimeout(3000);
  const api = await page.evaluate(async () => {
    const r = await fetch('/api/v1/messaging/channels/C4QCGENERAL0001/messages?limit=3',{credentials:'include'});
    const j = await r.json(); const arr=j.messages||j.data||j;
    return (Array.isArray(arr)?arr:[]).slice(0,2).map(m=>({id:m.id, body:m.body, fwd:m.forwarded_from?{ch:m.forwarded_from.channel_id, body:m.forwarded_from.body}:null}));
  });
  return {srcId, pickerText, generalTop: api};
};
