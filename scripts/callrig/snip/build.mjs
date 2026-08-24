export default async ({page}) => await page.evaluate(() => ({
  build: document.documentElement.dataset.dplId || document.documentElement.getAttribute('data-dpl-id'),
  url: location.origin
}));
