export default async ({page}) => { await page.keyboard.press('Escape'); await page.waitForTimeout(1500);
  await page.keyboard.press('Escape'); return page.url().replace(/^https:\/\/[^/]+/,''); };
