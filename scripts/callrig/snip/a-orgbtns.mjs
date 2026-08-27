export default async ({page}) => {
  const runs=[];
  for (let i=0;i<3;i++) {
    await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(5200);
    const chips = await page.evaluate(()=> [...document.querySelectorAll('button[data-testid="calendar-event-chip"]')]
      .map(e=>(e.innerText||'').replace(/\n+/g,' | ').slice(0,60)).filter(t=>/QA-A-SCHED/.test(t)));
    const chip = page.locator('button[data-testid="calendar-event-chip"]').filter({hasText:'QA-A-SCHED'}).nth(i % Math.max(1,chips.length));
    if (!(await chip.count())) { runs.push({i, err:'no chip', chips}); continue; }
    await chip.click(); await page.waitForTimeout(3000);
    const d = await page.evaluate(()=>{const dd=[...document.querySelectorAll('[role="dialog"]')].pop();
      return dd? {title: dd.innerText.split('\n')[0], btns:[...dd.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()).filter(Boolean),
                  t: dd.innerText.replace(/\n+/g,' | ').slice(0,180)} : {none:true};});
    runs.push({i, chips, dialog: d});
  }
  return runs;
};
