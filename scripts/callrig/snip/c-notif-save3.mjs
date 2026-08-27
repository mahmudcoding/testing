export default async ({page}) => {
  const WS = 'W4QCF1XTURESO01';
  const log = [];
  const onRes = async r => { const u=r.url(); if (u.includes('/notifications/settings')&&r.request().method()!=='GET') { let b=''; try{b=(await r.text()).slice(0,200);}catch(e){} log.push({m:r.request().method(), s:r.status(), body:b}); } };
  page.on('response', onRes);
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/notifications`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const save = async (i) => {
    await page.evaluate((k) => { document.querySelectorAll('[role="switch"]')[k].click(); }, i);
    await page.waitForTimeout(700);
    await page.evaluate(() => { const b=[...document.querySelectorAll('button')].find(b=>/save preferences/i.test((b.textContent||''))); if(b) b.click(); });
    await page.waitForTimeout(3000);
  };
  await save(1); // Mute channel notifications on
  const serverAfterOn = await page.evaluate(async () => (await (await fetch('/api/v1/notifications/settings',{credentials:'include'})).text()).slice(0,200));
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(3000);
  const switchesAfterReload = await page.evaluate(() => [...document.querySelectorAll('[role="switch"]')].map(e=>e.getAttribute('aria-checked')));
  await save(1); // revert
  const serverRestored = await page.evaluate(async () => (await (await fetch('/api/v1/notifications/settings',{credentials:'include'})).text()).slice(0,200));
  page.off('response', onRes);
  return {log, serverAfterOn, switchesAfterReload, serverRestored};
};
