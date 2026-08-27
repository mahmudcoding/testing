export default async ({ page }) => {
  const hit = await page.evaluate(() => {
    const b = document.querySelector('[data-testid="call-surface-minimize"]');
    if (!b || b.getBoundingClientRect().width===0) return false; b.click(); return true; });
  await page.waitForTimeout(2500);
  if (!page.url().includes('/calls')) {
    await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3500);
  }
  return { minimized: hit, url: page.url().slice(-30),
           stillInCall: await page.evaluate(()=>!!document.querySelector('[data-testid="call-surface"]')) };
};
