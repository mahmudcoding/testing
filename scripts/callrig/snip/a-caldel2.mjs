export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const out=[];
  for (let i=0;i<5;i++) {
    const chip = page.locator('button[data-testid="calendar-event-chip"]').filter({hasText:'QA-A-SCHED3'}).first();
    if (!(await chip.count())) { out.push('no QA-A-SCHED3 chip'); break; }
    await chip.click(); await page.waitForTimeout(2500);
    const btns = await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"]')].pop();
      return d? [...d.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()) : null;});
    out.push('dialog btns: '+JSON.stringify(btns));
    const del = page.locator('[role="dialog"] button').filter({hasText:/Delete/i}).first();
    if (!(await del.count())) break;
    await del.click(); await page.waitForTimeout(2000);
    const cbtns = await page.evaluate(()=>{const ds=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')]; const d=ds[ds.length-1];
      return d? [...d.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()) : null;});
    out.push('confirm btns: '+JSON.stringify(cbtns));
    const c = page.locator('[role="dialog"] button, [role="alertdialog"] button').filter({hasText:/^Delete/i}).last();
    if (await c.count()) { await c.click(); await page.waitForTimeout(3000); }
    await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(4500);
  }
  const left = await page.evaluate(()=> [...document.querySelectorAll('button[data-testid="calendar-event-chip"]')].map(e=>(e.innerText||'').split('\n')[0]).filter(t=>/QA-A-SCHED/.test(t)));
  return {out, left};
};
