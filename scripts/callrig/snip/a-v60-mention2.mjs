export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/c/C4QAGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const c = await page.$('div[contenteditable="true"][aria-label="Compose message"]');
  await c.click();
  await page.keyboard.down('Meta'); await page.keyboard.press('a'); await page.keyboard.up('Meta'); await page.keyboard.press('Backspace');
  await page.keyboard.type('V60-M2 cost-of-x *urgent* ', {delay:16});
  await page.keyboard.type('@qa_c', {delay:110});
  await page.waitForTimeout(2500);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);
  await page.keyboard.type(' please review', {delay:16});
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3500);
  out.channelRender = await page.evaluate(()=>{
    const m=[...document.querySelectorAll('[data-message-id]')].slice(-1)[0];
    return m?(m.innerText||'').replace(/\s+/g,' ').slice(-60):null;});
  return out;
};
