export default async ({page, ctx}) => {
  const cdp = await ctx.newCDPSession(page);
  const {windowId} = await cdp.send('Browser.getWindowForTarget');
  // un-maximize first so bounds apply cleanly, then maximize
  await cdp.send('Browser.setWindowBounds', {windowId, bounds:{windowState:'normal'}}).catch(()=>{});
  await cdp.send('Browser.setWindowBounds', {windowId, bounds:{windowState:'maximized'}});
  const {bounds} = await cdp.send('Browser.getWindowBounds', {windowId});
  await cdp.detach().catch(()=>{});
  return bounds;
};
