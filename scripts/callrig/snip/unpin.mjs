export default async ({page}) => {
  const b = page.locator('[data-testid="share-stage-unpin"]');
  if (await b.count()) { await b.click(); await page.waitForTimeout(2500); }
  return await page.evaluate(() => ({videos: document.querySelectorAll('video').length, thumbs: document.querySelectorAll('[data-testid="screen-share-thumbnail"]').length}));
};
