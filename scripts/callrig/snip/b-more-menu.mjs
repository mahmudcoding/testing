export default async ({page}) => {
  const id = process.env.QA_CH || 'C4QBGENERAL0001';
  if (!page.url().includes(id)) {
    await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3500);
  }
  const ids = await page.evaluate(() => [...document.querySelectorAll('[data-message-id]')].map(e=>e.getAttribute('data-message-id')));
  const mid = process.env.QA_MID || ids[ids.length-1];
  const before = await page.evaluate(() => document.body.innerHTML.length);
  const art = await page.$(`[data-message-id="${mid}"]`);
  await art.hover(); await page.waitForTimeout(700);
  const moreH = await page.evaluateHandle((mid) => {
    const a = document.querySelector(`[data-message-id="${mid}"]`);
    return [...a.querySelectorAll('button')].find(b => /more/i.test(b.getAttribute('aria-label')||'')) || null;
  }, mid);
  const more = moreH.asElement();
  if (!more) return {err:'no more button'};
  await more.click();
  await page.waitForTimeout(1200);
  const dump = await page.evaluate(() => {
    // find floating layers: elements with high z-index or data-radix portals
    const portals = [...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=dialog],[role=menu],[data-state=open]')];
    const info = portals.map(p => ({
      tag: p.tagName, role: p.getAttribute('role'), state: p.getAttribute('data-state'),
      text: (p.innerText||'').replace(/\s+/g,' ').slice(0,300),
      rect: (r=>({w:Math.round(r.width),h:Math.round(r.height)}))(p.getBoundingClientRect())
    }));
    return {portals: info, bodyLen: document.body.innerHTML.length};
  });
  await page.keyboard.press('Escape');
  return {mid, before, ...dump};
};
