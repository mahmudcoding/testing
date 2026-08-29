export default async ({page}) => {
  const before = await page.evaluate(() => document.visibilityState);
  await page.bringToFront();
  await page.waitForTimeout(6000);
  return { before, after: await page.evaluate(() => document.visibilityState),
    videos: await page.evaluate(() => [...document.querySelectorAll('video')].map(v => ({w: v.videoWidth, paused: v.paused, hasSrc: !!v.srcObject}))) };
};
