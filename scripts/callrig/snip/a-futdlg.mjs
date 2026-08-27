export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5200);
  const chip = page.locator('button[data-testid="calendar-event-chip"]').filter({hasText: process.env.QA_TITLE || 'QA-A-LATE'}).first();
  if (!(await chip.count())) return {err:'no QA-A-LATE chip'};
  await chip.click(); await page.waitForTimeout(3000);
  const d = await page.evaluate(()=>{const dd=[...document.querySelectorAll('[role="dialog"]')].pop();
    return dd? {title: dd.innerText.split('\n')[0], btns:[...dd.querySelectorAll('button')].map(b=>((b.getAttribute('aria-label')||b.textContent||'').trim()+(b.disabled?'[dis]':''))).filter(Boolean),
                t: dd.innerText.replace(/\n+/g,' | ').slice(0,200)} : {none:true};});
  return {dialog: d, now: new Date().toISOString()};
};
