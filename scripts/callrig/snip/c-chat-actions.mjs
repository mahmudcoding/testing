// Enumerate the message hover-action bar + "More" menu for own message in a channel.
export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const ch = process.env.CH || 'C4QCGENERAL0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  // send a fresh own message so we act on a known target
  const tag = process.env.TAG || 'QA-C-ACT';
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  await comp.click(); 
  await page.keyboard.press('Control+A'); await page.keyboard.press('Delete');
  await comp.type(tag);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2500);
  const msg = page.locator('[data-message-id]').last();
  const id = await msg.getAttribute('data-message-id');
  await msg.hover();
  await page.waitForTimeout(900);
  const bar = await page.evaluate(() => [...document.querySelectorAll('button[aria-label]')]
      .filter(b=>{const r=b.getBoundingClientRect(); return r.width>0&&r.height>0;})
      .map(b=>b.getAttribute('aria-label')));
  return {id, visibleButtons: bar.slice(-25), text: (await msg.innerText()).slice(0,80)};
};
