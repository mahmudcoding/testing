/* Focus the rig window without touching its bounds. */
export default async ({ page }) => {
  await page.bringToFront();
  return { url: page.url(), focused: await page.evaluate(() => document.hasFocus()) };
};
