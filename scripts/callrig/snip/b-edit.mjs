export default async ({page}) => {
  const id = process.env.QA_CH, mid = process.env.QA_MID, add = process.env.QA_ADD || ' EDITED';
  if (!page.url().includes(id)) {
    await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4000);
  }
  const art = await page.$(`[data-message-id="${mid}"]`);
  await art.hover(); await page.waitForTimeout(2000);
  const moreH = await page.evaluateHandle((mid) => {
    const a = document.querySelector(`[data-message-id="${mid}"]`);
    return [...a.querySelectorAll('button')].find(b => /more/i.test(b.getAttribute('aria-label')||'')) || null;
  }, mid);
  await moreH.asElement().click(); await page.waitForTimeout(1000);
  const ok = await page.evaluate(() => {
    const el = [...document.querySelectorAll('[role=menuitem]')].find(b => /^edit/i.test((b.innerText||'').trim()));
    if (!el) return false; el.click(); return true;
  });
  if (!ok) return {err:'no Edit item'};
  await page.waitForTimeout(1800);
  const probe = await page.evaluate((mid) => {
    const eds = [...document.querySelectorAll('div[contenteditable="true"]')].map(e => {
      const r = e.getBoundingClientRect();
      return {label: e.getAttribute('aria-label'), text: (e.innerText||'').slice(0,70),
              inMsg: !!e.closest('[data-message-id]'), focused: document.activeElement===e,
              rect:{y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}};
    });
    return {editors: eds};
  }, mid);
  return {mid, probe};
};
