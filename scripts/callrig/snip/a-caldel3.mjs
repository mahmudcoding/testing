export default async ({page}) => {
  const T = process.env.QA_TITLE || 'QA-A-';
  const out=[];
  for (let i=0;i<6;i++) {
    await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(5000);
    const chip = page.locator('button[data-testid="calendar-event-chip"]').filter({hasText:T}).first();
    if (!(await chip.count())) { out.push('none left'); break; }
    await chip.click(); await page.waitForTimeout(4000);
    const del = page.locator('[role="dialog"] button:has-text("Delete")').first();
    if (!(await del.count())) { out.push('no Delete on '+T); break; }
    await del.click(); await page.waitForTimeout(2000);
    const conf = page.locator('[role="dialog"] button, [role="alertdialog"] button').filter({hasText:/^(Delete|Delete meeting|Yes|Confirm)$/}).last();
    if (await conf.count()) { await conf.click(); }
    await page.waitForTimeout(3000);
    out.push('deleted one '+T);
  }
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const left = await page.evaluate(()=> [...document.querySelectorAll('button[data-testid="calendar-event-chip"]')].map(e=>(e.innerText||'').split('\n')[0]).filter(t=>/QA-A-/.test(t)));
  return {out, left};
};
