export default async ({page}) => {
  await page.mouse.move(700,400); await page.waitForTimeout(400);
  const b = page.locator('button[aria-label="Leave call"]').first();
  const n = await b.count(); if (n) { await b.click(); await page.waitForTimeout(2500); }
  const c = page.locator('[data-testid="call-leave-confirm-submit"]').first();
  if (await c.count()) { await c.click(); }
  await page.waitForTimeout(5000);
  await page.keyboard.press('Escape').catch(()=>{});
  await page.waitForTimeout(1500);
  return {btn:n, path: await page.evaluate(()=>location.pathname)};
};
