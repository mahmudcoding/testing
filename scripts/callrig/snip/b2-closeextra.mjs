export default async ({page, ctx}) => {
  const pages = ctx.pages();
  if (pages.length <= 1) return {kept: pages.length, closed: 0};
  // close the currently driven page if another remains
  const url = page.url();
  await page.close();
  return {closedUrl: url.replace(/^https?:\/\/[^/]+/,''), remaining: ctx.pages().length};
};
