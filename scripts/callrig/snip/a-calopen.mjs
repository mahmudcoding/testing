export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  const chip = page.locator('button[data-testid="calendar-event-chip"]').filter({hasText: process.env.QA_TITLE || 'QA-A-SCHED3'}).first();
  const n = await chip.count();
  if (!n) return {err:'no chip'};
  await chip.click();
  await page.waitForTimeout(3500);
  const d = await page.evaluate(()=>{
    const dd=[...document.querySelectorAll('[role="dialog"]')].pop();
    if (!dd) return {none:true, url: location.href};
    return {t: dd.innerText.replace(/\n+/g,' | ').slice(0,520),
      btns: [...dd.querySelectorAll('button,a')].map(b=>((b.getAttribute('aria-label')||b.textContent||'').trim()+(b.disabled?'[dis]':'')).slice(0,30)).filter(Boolean)};
  });
  return {chips:n, dialog:d, now:new Date().toISOString()};
};
