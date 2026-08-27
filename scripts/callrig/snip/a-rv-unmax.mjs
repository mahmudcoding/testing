export default async ({ page, ctx, browser }) => {
  const s = await page.evaluate(() => ({ w: screen.availWidth, h: screen.availHeight, left: screen.availLeft||0, top: screen.availTop||0 }));
  const ps = await ctx.newCDPSession(page);
  const { targetInfo } = await ps.send('Target.getTargetInfo');
  const bs = await browser.newBrowserCDPSession();
  const { windowId } = await bs.send('Browser.getWindowForTarget', { targetId: targetInfo.targetId });
  await bs.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'normal' } });
  await bs.send('Browser.setWindowBounds', { windowId, bounds: { left: s.left, top: s.top, width: s.w, height: s.h } });
  await page.bringToFront();
  await page.waitForTimeout(1200);
  // close the Participants panel if it is open
  const p = page.locator('button[aria-label="Participants"]').first();
  if (await p.count() && (await p.getAttribute('aria-pressed')) === 'true') { await p.click().catch(()=>{}); await page.waitForTimeout(1200); }
  return await page.evaluate(() => ({ inner: [innerWidth, innerHeight], peopleOpen: !!document.querySelector('[data-testid="participants-list"]') }));
};
