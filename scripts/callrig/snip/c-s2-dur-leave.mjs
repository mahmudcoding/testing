export default async ({page}) => {
  let clicked=null;
  for (const sel of ['button[aria-label="Leave call"]','button[aria-label="End call"]']) {
    try { await page.locator(sel).last().click({timeout:6000}); clicked=sel; break; } catch(e){}
  }
  const t = Date.now();
  await page.waitForTimeout(1500);
  try { await page.locator('[data-testid="call-end-confirm-submit"]').last().click({timeout:3000}); } catch(e){}
  await page.waitForTimeout(2000);
  return {leftEpoch:t, iso:new Date(t).toISOString(), clicked, url:page.url()};
};
