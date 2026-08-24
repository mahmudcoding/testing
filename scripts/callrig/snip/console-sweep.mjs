export default async ({page}) => {
  const errs=[], failed=[];
  page.on('console', m=>{ if(m.type()==='error') errs.push(m.text().slice(0,200)); });
  page.on('pageerror', e=>errs.push('PAGEERROR: '+String(e).slice(0,220)));
  page.on('response', r=>{ if(r.status()>=400 && r.url().includes('/api/')) failed.push(`${r.status()} ${r.request().method()} ${r.url().replace('https://airion-cargo.store','')}`); });
  for (const path of ['/w/W4QAF1XTURESO01/calls','/w/W4QAF1XTURESO01/calendar','/w/W4QAF1XTURESO01/settings/calls']) {
    await page.goto('https://airion-cargo.store'+path, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(5000);
  }
  return {consoleErrors:[...new Set(errs)].slice(0,12), failedApi:[...new Set(failed)].slice(0,12)};
};
