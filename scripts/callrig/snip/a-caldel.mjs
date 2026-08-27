export default async ({page}) => {
  const out = [];
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  for (let i=0;i<6;i++) {
    const chip = page.locator('button[data-testid="calendar-event-chip"]').filter({hasText:'QA-A-SCHED'}).first();
    if (!(await chip.count())) { out.push('no more chips'); break; }
    await chip.click(); await page.waitForTimeout(2200);
    const del = page.locator('[role="dialog"] button:has-text("Delete")').first();
    if (!(await del.count())) { out.push('no delete button'); break; }
    await del.click(); await page.waitForTimeout(1800);
    const confirm = page.locator('[role="dialog"] button, [role="alertdialog"] button').filter({hasText:/^(Delete|Yes|Confirm|Delete meeting)$/}).last();
    if (await confirm.count()) { await confirm.click(); }
    await page.waitForTimeout(3000);
    out.push('deleted #'+(i+1));
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4500);
  }
  const left = await page.evaluate(()=> [...document.querySelectorAll('button[data-testid="calendar-event-chip"]')].map(e=>(e.innerText||'').split('\n')[0]).filter(t=>/QA-A-SCHED/.test(t)));
  return {out, left};
};
