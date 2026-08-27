export default async ({page}) => {
  const WS = 'W4QCF1XTURESO01';
  const log = [];
  const onReq = r => { const u=r.url(); if (u.includes('/notifications/settings')) log.push({t:'req', m:r.method(), body:(r.postData()||'').slice(0,200)}); };
  const onRes = async r => { const u=r.url(); if (u.includes('/notifications/settings')) { let b=''; try{b=(await r.text()).slice(0,250);}catch(e){b='<'+e.message+'>';} log.push({t:'res', m:r.request().method(), s:r.status(), body:b}); } };
  page.on('request', onReq); page.on('response', onRes);
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/notifications`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  log.length = 0;
  await page.evaluate(() => { document.querySelectorAll('[role="switch"]')[0].click(); });
  await page.waitForTimeout(800);
  await page.evaluate(() => { const b=[...document.querySelectorAll('button')].find(b=>/save preferences/i.test((b.textContent||''))); if(b) b.click(); });
  await page.waitForTimeout(4000);
  const toast = await page.evaluate(() => (document.body.innerText.match(/[^\n]*(saved|error|failed|Try again|updated)[^\n]*/gi)||[]).slice(0,6));
  const switches = await page.evaluate(() => [...document.querySelectorAll('[role="switch"]')].map(e=>e.getAttribute('aria-checked')));
  page.off('request', onReq); page.off('response', onRes);
  return {log, toast, switches};
};
