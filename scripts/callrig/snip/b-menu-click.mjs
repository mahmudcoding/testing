export default async ({page}) => {
  const id = process.env.QA_CH;
  const item = process.env.QA_ITEM;
  if (!page.url().includes(id)) {
    await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3500);
  }
  const ids = await page.evaluate(() => [...document.querySelectorAll('[data-message-id]')].map(e=>e.getAttribute('data-message-id')));
  const mid = process.env.QA_MID || ids[ids.length-1];
  const art = await page.$(`[data-message-id="${mid}"]`);
  await art.hover(); await page.waitForTimeout(700);
  const moreH = await page.evaluateHandle((mid) => {
    const a = document.querySelector(`[data-message-id="${mid}"]`);
    return [...a.querySelectorAll('button')].find(b => /more/i.test(b.getAttribute('aria-label')||'')) || null;
  }, mid);
  const more = moreH.asElement();
  if (!more) return {err:'no more button'};
  await more.click(); await page.waitForTimeout(1000);
  const clicked = await page.evaluate((item) => {
    const el = [...document.querySelectorAll('[role=menuitem]')].find(b => (b.innerText||'').trim().toLowerCase().includes(item.toLowerCase()));
    if (!el) return false; el.click(); return true;
  }, item);
  await page.waitForTimeout(2000);
  // confirm dialog?
  const dlg = await page.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter(p=>{const r=p.getBoundingClientRect();return r.width>0&&r.height>0;});
    return d.map(p => (p.innerText||'').replace(/\s+/g,' ').slice(0,220));
  });
  return {mid, item, clicked, dialogs: dlg};
};
