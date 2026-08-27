export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const hdr = () => page.evaluate(()=>{
    const m=document.querySelector('main');
    const t=m.innerText.split('\n').filter(Boolean).slice(0,6).join(' | ');
    return {hdr:t.slice(0,140), chips:[...document.querySelectorAll('button[data-testid="calendar-event-chip"]')].length};
  });
  const out={};
  for (const v of ['Day','Week','Month']) {
    await page.locator(`main button:has-text("${v}")`).first().click();
    await page.waitForTimeout(2500);
    out[v] = await hdr();
  }
  // navigation in Month
  await page.locator('button[aria-label="Next"]').first().click(); await page.waitForTimeout(2200);
  out.monthNext = await hdr();
  await page.locator('button[aria-label="Previous"]').first().click(); await page.waitForTimeout(2200);
  out.monthBack = await hdr();
  await page.locator('main button:has-text("Today")').first().click(); await page.waitForTimeout(2200);
  out.today = await hdr();
  return out;
};
