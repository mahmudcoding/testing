import { full, closePeople, closeSideRooms } from './a-callkit.mjs';
export default async ({ page, ctx, browser }) => {
  await full({ page, ctx, browser });
  await closeSideRooms(page); await closePeople(page);
  return await page.evaluate(() => ({ inner: [innerWidth, innerHeight] }));
};
