export default async ({page}) => {
  const WS = 'W4QCF1XTURESO01';
  const reqs = [];
  const onReq = r => { const u = r.url(); if (u.includes('/api/')) reqs.push(r.method()+' '+u.replace('https://airion-cargo.store','')); };
  page.on('request', onReq);
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/notifications`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const btns = () => page.evaluate(() => [...document.querySelectorAll('button')]
      .filter(b=>b.offsetParent||b.getClientRects().length)
      .map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim().slice(0,40), d:b.disabled}))
      .filter(x=>/save|discard|cancel|apply/i.test(x.l)));
  const saveBarBeforeClick = await btns();
  const sw = () => page.evaluate(() => [...document.querySelectorAll('[role="switch"]')].map(e=>e.getAttribute('aria-checked')));
  const s0 = await sw();
  reqs.length = 0;
  await page.evaluate(() => { document.querySelectorAll('[role="switch"]')[0].click(); });
  await page.waitForTimeout(1200);
  const saveBarAfterClick = await btns();
  const s1 = await sw();
  // press Save preferences
  const clicked = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(b=>/save preferences/i.test((b.textContent||'')));
    if (!b) return false; b.click(); return true;
  });
  await page.waitForTimeout(3000);
  const reqsAfterSave = reqs.filter(r=>!r.startsWith('GET')).slice(0,10);
  const server = await page.evaluate(async () => (await (await fetch('/api/v1/notifications/settings',{credentials:'include'})).text()).slice(0,200));
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  const s2 = await sw();
  // restore: turn it back on and save
  await page.evaluate(() => { document.querySelectorAll('[role="switch"]')[0].click(); });
  await page.waitForTimeout(800);
  await page.evaluate(() => { const b=[...document.querySelectorAll('button')].find(b=>/save preferences/i.test((b.textContent||''))); if(b) b.click(); });
  await page.waitForTimeout(2500);
  const serverRestored = await page.evaluate(async () => (await (await fetch('/api/v1/notifications/settings',{credentials:'include'})).text()).slice(0,200));
  page.off('request', onReq);
  return {saveBarBeforeClick, s0, saveBarAfterClick, s1, clickedSave: clicked, reqsAfterSave, server, sAfterReload: s2, serverRestored};
};
