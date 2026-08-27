export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const b = page.locator('button[aria-label^="Notifications"]').first();
  if (!(await b.count())) return {err:'no bell'};
  await b.click(); await page.waitForTimeout(3000);
  return await page.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
      return r.width>2 && r.height>2 && s.visibility!=='hidden' && s.display!=='none'; };
    const panel = [...document.querySelectorAll('[role="dialog"],[data-testid*="notif" i],aside')].filter(vis).pop();
    if (!panel) return {none:true, body: document.body.innerText.slice(-300)};
    const items = [...panel.querySelectorAll('li,[role="listitem"],a')].map(e=>e.innerText.replace(/\n+/g,' | ').trim()).filter(Boolean);
    return {panel: panel.innerText.replace(/\n+/g,' | ').slice(0,700), items: items.slice(0,8)};
  });
};
