export default async ({page}) => {
  const before = await page.evaluate(() => ({dialogs: document.querySelectorAll('[role="dialog"]').length, bodyLen: document.body.innerText.length}));
  const b = await page.$('button[aria-label="New Side Room"]');
  const clicked = !!b;
  const netlog = [];
  page.on('response', r => { const u=r.url(); if(u.includes('/api/v1/')) netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')}`); });
  const consoleErrs = [];
  page.on('console', m => { if (m.type()==='error') consoleErrs.push(m.text().slice(0,200)); });
  page.on('pageerror', e => consoleErrs.push('PAGEERROR: '+String(e).slice(0,250)));
  if (b) await b.click();
  await page.waitForTimeout(4000);
  const after = await page.evaluate(() => ({
    dialogs: [...document.querySelectorAll('[role="dialog"],[role="alertdialog"],[data-radix-popper-content-wrapper]')].map(d=>({tid:d.getAttribute('data-testid'), t:d.innerText.replace(/\n+/g,' | ').slice(0,300)})),
    bodyTail: document.body.innerText.replace(/\n+/g,' | ').slice(-600),
    inputs: [...document.querySelectorAll('input,textarea')].map(e=>`${e.type}|${e.placeholder||''}|${e.getAttribute('data-testid')||''}`)
  }));
  return {clicked, before, after, net: netlog, consoleErrs};
};
