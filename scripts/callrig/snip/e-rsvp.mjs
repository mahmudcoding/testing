export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const chip = page.locator('button[data-testid="calendar-event-chip"]').filter({hasText:'QA-E Sync 3'}).first();
  await chip.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await chip.click();
  await page.waitForTimeout(2500);
  return await page.evaluate(() => {
    const vis = e => { const r=e.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const d=document.querySelector('[role=dialog]')||document.querySelector('[role=tooltip]');
    if(!d) return {opened:false, body:(document.querySelector('main')||document.body).innerText.slice(0,300)};
    return {opened:true, txt:d.innerText.replace(/\n{2,}/g,' | ').slice(0,900),
      btns:[...d.querySelectorAll('button,a')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim()).filter(Boolean).slice(0,25)};
  });
};
