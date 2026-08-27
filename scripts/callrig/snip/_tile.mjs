/* Infrastructure, not a repro: park the rig window on the right of the screen
 * so it does not sit under whatever is driving it.
 *   QA_TILE_LEFT — points reserved on the left for the other window (default 520)
 */
export default async ({ page, ctx, browser }) => {
  const reserve = Number(process.env.QA_TILE_LEFT || 520);
  const s = await page.evaluate(() => ({
    w: screen.availWidth, h: screen.availHeight,
    left: screen.availLeft || 0, top: screen.availTop || 0,
  }));
  const left = s.left + reserve;
  const width = Math.max(560, s.w - reserve);

  const ps = await ctx.newCDPSession(page);
  const { targetInfo } = await ps.send('Target.getTargetInfo');
  const bs = await browser.newBrowserCDPSession();
  const { windowId } = await bs.send('Browser.getWindowForTarget',
    { targetId: targetInfo.targetId });
  // a maximized window ignores bounds until it is normal again
  await bs.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'normal' } });
  await bs.send('Browser.setWindowBounds',
    { windowId, bounds: { left, top: s.top, width, height: s.h } });
  await page.bringToFront();
  return (await bs.send('Browser.getWindowForTarget', { targetId: targetInfo.targetId })).bounds;
};
