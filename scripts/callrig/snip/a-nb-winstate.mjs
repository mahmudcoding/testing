export default async ({page, ctx}) => {
  const cdp = await ctx.newCDPSession(page);
  const r = await cdp.send('Browser.getWindowForTarget');
  const vp = await page.evaluate(()=>({w:innerWidth,h:innerHeight,vis:document.visibilityState}));
  return {bounds:r.bounds, viewport:vp};
};
