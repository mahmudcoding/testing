export default async ({page}) => {
  const id = process.env.QA_CH, mid = process.env.QA_MID;
  if (!page.url().includes(id)) {
    await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3500);
  }
  const art = await page.$(`[data-message-id="${mid}"]`);
  await art.hover(); await page.waitForTimeout(700);
  const moreH = await page.evaluateHandle((mid) => {
    const a = document.querySelector(`[data-message-id="${mid}"]`);
    return [...a.querySelectorAll('button')].find(b => /more/i.test(b.getAttribute('aria-label')||'')) || null;
  }, mid);
  await moreH.asElement().click(); await page.waitForTimeout(900);
  await page.evaluate(() => {
    const el = [...document.querySelectorAll('[role=menuitem]')].find(b => /^edit/i.test((b.innerText||'').trim()));
    el && el.click();
  });
  await page.waitForTimeout(1500);
  return await page.evaluate(() => {
    const eds = [...document.querySelectorAll('div[contenteditable="true"]')].map(e => {
      const r = e.getBoundingClientRect();
      return {label: e.getAttribute('aria-label'), text: (e.innerText||'').slice(0,60),
              rect:{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)},
              focused: document.activeElement===e,
              inMsg: !!e.closest('[data-message-id]')};
    });
    const dialogs = [...document.querySelectorAll('[role=dialog]')].filter(p=>p.getBoundingClientRect().width>0)
      .map(p => (p.innerText||'').replace(/\s+/g,' ').slice(0,200));
    return {editors: eds, dialogs, active: document.activeElement && document.activeElement.tagName+'/'+(document.activeElement.getAttribute('aria-label')||'')};
  });
};
