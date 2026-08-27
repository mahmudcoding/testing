export default async ({page}) => {
  const T = process.env.QA_TITLE || 'QA-A-SOON';
  const log=[];
  for (let round=0; round<4; round++) {
    await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(5200);
    const chip = page.locator('button[data-testid="calendar-event-chip"]').filter({hasText:T}).first();
    if (!(await chip.count())) { log.push('no chip '+T); break; }
    await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(700);
    await chip.click(); await page.waitForTimeout(4000);
    const info = await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"]')].pop();
      if(!d) return {noDialog:true};
      const bs=[...d.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim());
      return {title:d.innerText.split('\n')[0], bs, delIdx: bs.findIndex(x=>/^Delete/i.test(x))};});
    log.push(JSON.stringify(info).slice(0,200));
    if (info.noDialog || info.delIdx < 0) break;
    const btn = page.locator('[role="dialog"]').last().locator('button').nth(info.delIdx);
    await btn.click(); await page.waitForTimeout(2500);
    const conf = await page.evaluate(()=>{const ds=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')]; const d=ds[ds.length-1];
      if(!d) return {noConfirm:true};
      const bs=[...d.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim());
      return {t:d.innerText.replace(/\n+/g,' | ').slice(0,140), bs, okIdx: bs.findIndex(x=>/^(Delete|Yes|Confirm)/i.test(x))};});
    log.push('confirm: '+JSON.stringify(conf).slice(0,200));
    if (!conf.noConfirm && conf.okIdx >= 0) {
      await page.locator('[role="dialog"],[role="alertdialog"]').last().locator('button').nth(conf.okIdx).click();
      await page.waitForTimeout(3000);
    }
  }
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const left = await page.evaluate(()=> [...document.querySelectorAll('button[data-testid="calendar-event-chip"]')].map(e=>(e.innerText||'').split('\n')[0]).filter(t=>/QA-A-/.test(t)));
  return {log, left};
};
