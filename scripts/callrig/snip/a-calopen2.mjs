export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5200);
  const T = process.env.QA_TITLE || 'QA-A-DECLINE';
  const chip = page.locator('button[data-testid="calendar-event-chip"]').filter({hasText:T}).first();
  if (!(await chip.count())) return {err:'no chip'};
  const box1 = await chip.boundingBox();
  const vp = page.viewportSize();
  await chip.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  const box2 = await chip.boundingBox();
  await chip.click();
  await page.waitForTimeout(3500);
  const d = await page.evaluate(()=>{const dd=[...document.querySelectorAll('[role="dialog"]')].pop();
    return dd? {title: dd.innerText.split('\n')[0], btns:[...dd.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()).filter(Boolean)} : {none:true};});
  return {viewport: vp, boxBeforeScroll: box1, boxAfterScroll: box2, dialog: d};
};
