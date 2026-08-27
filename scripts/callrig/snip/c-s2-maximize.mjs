export default async ({page, ctx}) => {
  const s = await ctx.newCDPSession(page);
  const {windowId} = await s.send('Browser.getWindowForTarget');
  await s.send('Browser.setWindowBounds', {windowId, bounds:{windowState:'maximized'}});
  await new Promise(r=>setTimeout(r,900));
  const b = await s.send('Browser.getWindowBounds', {windowId});
  await s.detach();
  return b.bounds;
};
