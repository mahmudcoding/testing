export default async ({page}) => {
  const id = process.env.QA_CH || 'C4QBGENERAL0001';
  const texts = JSON.parse(process.env.QA_TEXTS);
  if (!page.url().includes(id)) {
    await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3500);
  }
  const sel = 'div[contenteditable="true"][aria-label="Compose message"]';
  const out = [];
  for (const t of texts) {
    await page.click(sel);
    await page.type(sel, t, {delay: 12});
    await page.waitForTimeout(250);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1200);
    out.push(t.slice(0,40));
  }
  await page.waitForTimeout(1500);
  const state = await page.evaluate(() => {
    const msgs = [...document.querySelectorAll('[data-message-id]')];
    return {count: msgs.length, last: msgs.slice(-6).map(m => ({
      id: m.getAttribute('data-message-id'),
      text: (m.innerText||'').replace(/\s+/g,' ').slice(0,90)
    }))};
  });
  return {sent: out, state};
};
