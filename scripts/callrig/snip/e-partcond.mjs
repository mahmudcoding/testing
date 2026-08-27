export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  const out={};
  for (const t of ['QA-E Sync 1','QA-E Sync 2','QA-E Sync 3']) {
    await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3800);
    const chip = page.locator('button[data-testid="calendar-event-chip"]').filter({hasText:t}).first();
    await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
    await chip.click(); await page.waitForTimeout(3000);
    out[t] = await page.evaluate(()=>{
      const d=document.querySelector('[role=dialog]');
      if(!d) return 'no dialog';
      const t=d.innerText;
      const head=t.split('Your response')[0].replace(/\n+/g,' | ').slice(0,220);
      return {unavailable:/Participant list unavailable/.test(t), head};
    });
    await page.keyboard.press('Escape').catch(()=>{});
    await page.waitForTimeout(600);
  }
  return out;
};
