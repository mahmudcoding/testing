export default async ({page}) => {
  const WS = 'W4QCF1XTURESO01';
  const reqs = [];
  const onReq = r => { const u = r.url(); if (u.includes('/api/')) reqs.push(r.method()+' '+u.replace('https://airion-cargo.store','')); };
  page.on('request', onReq);
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/notifications`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);

  const serverBefore = await page.evaluate(async () => {
    const r = await fetch('/api/v1/notifications/settings', {credentials:'include'});
    return {s:r.status, j: (await r.text()).slice(0,300)};
  });

  const listSwitches = () => page.evaluate(() => {
    const m = document.querySelector('main') || document.body;
    return [...m.querySelectorAll('button[role="switch"],input[type=checkbox],[role="switch"]')].map((e,i)=>({
      i, tag:e.tagName, checked: e.getAttribute('aria-checked') ?? (e.checked!==undefined? String(e.checked):null),
      label: (e.getAttribute('aria-label')||e.closest('label')?.innerText||e.parentElement?.innerText||'').replace(/\n+/g,' | ').trim().slice(0,80),
      testid: e.getAttribute('data-testid')
    }));
  });
  const before = await listSwitches();
  reqs.length = 0;
  await page.evaluate(() => {
    const m = document.querySelector('main') || document.body;
    const els = [...m.querySelectorAll('button[role="switch"],input[type=checkbox],[role="switch"]')];
    els[0].click();
  });
  await page.waitForTimeout(3000);
  const afterClick = await listSwitches();
  const reqsAfterClick = reqs.filter(r=>!r.startsWith('GET')).slice(0,20);
  const allReqs = reqs.slice(0,25);

  const serverAfter = await page.evaluate(async () => {
    const r = await fetch('/api/v1/notifications/settings', {credentials:'include'});
    return {s:r.status, j: (await r.text()).slice(0,300)};
  });

  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const afterReload = await listSwitches();
  page.off('request', onReq);
  return {serverBefore, before, afterClick, reqsAfterClick, allReqs, serverAfter, afterReload};
};
