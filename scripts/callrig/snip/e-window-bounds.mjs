/* Set the rig window bounds from QA_WIN="left,top,width,height". */
export default async ({ page, ctx, browser }) => {
  const [left, top, width, height] = (process.env.QA_WIN || '0,38,1440,894')
    .split(',').map(Number);
  const ps = await ctx.newCDPSession(page);
  const { targetInfo } = await ps.send('Target.getTargetInfo');
  const bs = await browser.newBrowserCDPSession();
  const { windowId } = await bs.send('Browser.getWindowForTarget',
    { targetId: targetInfo.targetId });
  await bs.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'normal' } });
  await bs.send('Browser.setWindowBounds', { windowId, bounds: { left, top, width, height } });
  await page.bringToFront();
  return (await bs.send('Browser.getWindowForTarget', { targetId: targetInfo.targetId })).bounds;
};
