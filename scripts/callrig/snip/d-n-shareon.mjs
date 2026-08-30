export default async ({page}) => {
  const b = page.locator('[data-testid="call-controls-screen-share"]').first();
  const l0 = await b.getAttribute('aria-label');
  if (!/Share screen/.test(l0||'')) return {skipped:l0};
  const box=await b.boundingBox(); await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
  await page.waitForTimeout(5000);
  return {l0, l1: await b.getAttribute('aria-label')};
};
