export default async ({page, ctx}) => {
  const s = await ctx.newCDPSession(page);
  const {windowId} = await s.send('Browser.getWindowForTarget');
  await s.send('Browser.setWindowBounds', {windowId, bounds:{windowState:'normal'}});
  await s.send('Browser.setWindowBounds', {windowId, bounds:{left:0, top:0, width:700, height:800}});
  await new Promise(r=>setTimeout(r,1200));
  const b = await s.send('Browser.getWindowBounds', {windowId});
  await s.detach();
  return {bounds:b.bounds, vis: await page.evaluate(()=>document.visibilityState)};
};
