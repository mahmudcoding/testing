export default async ({page}) => await page.evaluate(() => ({
  url: location.pathname.slice(0,40),
  visibilityState: document.visibilityState,
  hasFocus: document.hasFocus(),
  hidden: document.hidden
}));
