import { leaveRoom, inSideRoom, full, closeSideRooms, closePeople } from './a-callkit.mjs';
export default async ({ page, ctx, browser }) => {
  await full({page, ctx, browser});
  const before = await inSideRoom(page);
  const r = before ? await leaveRoom(page) : { left: true, skipped: true };
  await closeSideRooms(page); await closePeople(page);
  return { before, ...r, after: await inSideRoom(page) };
};
