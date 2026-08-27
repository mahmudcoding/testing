export default async ({page}) => {
  const cdp=await page.context().newCDPSession(page);
  await cdp.send('Emulation.clearDeviceMetricsOverride');
  await page.waitForTimeout(2000);
  return await page.evaluate(()=>({innerW:innerWidth, innerH:innerHeight}));
};
