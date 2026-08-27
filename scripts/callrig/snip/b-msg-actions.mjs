export default async ({page}) => {
  const id = process.env.QA_CH || 'C4QBGENERAL0001';
  if (!page.url().includes(id)) {
    await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3500);
  }
  const ids = await page.evaluate(() => [...document.querySelectorAll('[data-message-id]')].map(e=>e.getAttribute('data-message-id')));
  if (!ids.length) return {err:'no messages'};
  const mid = process.env.QA_MID || ids[ids.length-1];
  const art = await page.$(`[data-message-id="${mid}"]`);
  await art.hover();
  await page.waitForTimeout(900);
  const toolbar = await page.evaluate((mid) => {
    const a = document.querySelector(`[data-message-id="${mid}"]`);
    return [...a.querySelectorAll('button')].filter(b=>{const r=b.getBoundingClientRect();return r.width>0&&r.height>0;})
      .map(b => (b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim());
  }, mid);
  let menuItems = null;
  const moreH = await page.evaluateHandle((mid) => {
    const a = document.querySelector(`[data-message-id="${mid}"]`);
    return [...a.querySelectorAll('button')].find(b => /more|action/i.test(b.getAttribute('aria-label')||'')) || null;
  }, mid);
  const more = moreH.asElement();
  if (more) {
    await more.click();
    await page.waitForTimeout(1000);
    menuItems = await page.evaluate(() => [...document.querySelectorAll('[role=menuitem],[role=menuitemradio]')]
      .filter(b=>{const r=b.getBoundingClientRect();return r.width>0&&r.height>0;})
      .map(b => (b.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean));
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
  return {mid, toolbar, menuItems};
};
