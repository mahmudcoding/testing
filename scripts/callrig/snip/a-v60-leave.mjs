export default async ({ page }) => {
  const b = page.locator('button').filter({hasText:/End for everyone/i}).first();
  if(await b.count()){ await b.click().catch(()=>{}); await page.waitForTimeout(2200); }
  const s = page.locator('[data-testid="call-end-confirm-submit"]').first();
  if(await s.count()){ await s.click().catch(()=>{}); }
  await page.waitForTimeout(7000);
  return await page.evaluate(()=>({url:location.pathname}));
};
