/* Bring the rig window on screen: report its bounds, then normalise + resize. */
export default async ({ page, ctx, browser }) => {
  const ps = await ctx.newCDPSession(page);
  const { targetInfo } = await ps.send('Target.getTargetInfo');
  const bs = await browser.newBrowserCDPSession();
  const { windowId, bounds } = await bs.send('Browser.getWindowForTarget',
    { targetId: targetInfo.targetId });
  const before = { ...bounds };
  if (bounds.windowState !== 'normal') {
    await bs.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'normal' } });
  }
  await bs.send('Browser.setWindowBounds',
    { windowId, bounds: { left: 40, top: 60, width: 1500, height: 940 } });
  await page.bringToFront();
  const after = (await bs.send('Browser.getWindowForTarget',
    { targetId: targetInfo.targetId })).bounds;
  return { before, after, url: page.url() };
};
