export default async ({page}) => {
  const out={};
  await page.waitForTimeout(12000);
  for (const sel of ['button[aria-label="Leave call"]','button[aria-label="End call"]']) {
    try { await page.locator(sel).last().click({timeout:5000}); out.clicked=sel; break; } catch(e){}
  }
  await page.waitForTimeout(2000);
  try { await page.locator('[data-testid="call-end-confirm-submit"]').last().click({timeout:4000}); out.confirmed=true; } catch(e){}
  await page.waitForTimeout(6000);
  out.url = page.url();
  return out;
};
