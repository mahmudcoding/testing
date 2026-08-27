export default async ({page}) => {
  let clicked=null;
  for (const sel of ['button[aria-label="Accept"]','button[aria-label="Accept call"]']) {
    try { await page.locator(sel).last().click({timeout:6000}); clicked=sel; break; } catch(e){}
  }
  const t = Date.now();
  await page.waitForTimeout(2500);
  return {acceptedEpoch:t, iso:new Date(t).toISOString(), clicked, url:page.url()};
};
