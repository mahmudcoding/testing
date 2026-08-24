export default async ({page}) => {
  const net = [];
  page.on('response', async r => { const u=r.url(); if(u.includes('/api/v1/')){ let b=''; try{b=(await r.text()).slice(0,220);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);} });
  const errs = [];
  page.on('console', m => { if (m.type()==='error') errs.push(m.text().slice(0,200)); });
  page.on('pageerror', e => errs.push('PAGEERROR: '+String(e).slice(0,200)));
  const s = page.locator('[role="dialog"] input[type=search]').last();
  await s.fill('Dave');
  const snaps = [];
  for (let i=0;i<6;i++) {
    await page.waitForTimeout(2000);
    snaps.push(await page.evaluate(() => {
      const dlg = [...document.querySelectorAll('[role="dialog"]')].pop();
      const body = dlg.querySelector('[data-testid="add-to-call-members"]') || dlg;
      return {t: body.innerText.replace(/\n+/g,' | ').slice(0,160), n: dlg.querySelectorAll('input[type=checkbox]').length};
    }));
  }
  return {snaps, net: net.slice(-12), errs};
};
