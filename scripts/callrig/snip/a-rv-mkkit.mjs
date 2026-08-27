import { createRoom, leaveRoom, rooms, inSideRoom, openSideRooms, install } from './a-callkit.mjs';
export default async ({ page }) => {
  const out = {};
  out.panelOpen = await openSideRooms(page);
  out.newVisible = await page.evaluate(() => [...document.querySelectorAll('button')].filter(window.__qa.vis).map(b=>window.__qa.nameOf(b).trim()).filter(n=>/New Side Room/.test(n)));
  out.create = await createRoom(page, process.env.QA_ROOM || 'Room C');
  out.inRoomAfterCreate = await inSideRoom(page);
  out.leave = await leaveRoom(page);
  out.rooms = await rooms(page, process.env.QA_CALL);
  return out;
};
