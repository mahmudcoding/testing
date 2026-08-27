/* Repro: a side room nobody is sitting in is not offered as a destination in
 * "Move to Side Room" — so the first person can never be moved into it.
 * Report: lane A, "[FE-WEB][CALLS][SIDE ROOMS] Только что созданная пустая Side Room
 * недоступна как назначение в «Move to Side Room»"
 *
 *   ./d a:alice snip/a-side-emptyroom.mjs
 *
 * Leaves TWO rooms open — one with somebody in it, one empty — so the menu you
 * are about to open carries its own control: the occupied room is listed, the
 * empty one is not.
 */
import { attach, ensureCall, joinCall, admitAll, inCall, rooms, createRoom, joinRoom,
         leaveRoom, inSideRoom, openSideRooms, closeMenus, closePeople, closeSideRooms,
         openPeople, panel, tile, full, NAME } from './a-callkit.mjs';

const FULL = 'Room A';      // someone sits in this one
const EMPTY = 'Room B';     // this one stays empty — the finding's subject

export default async ({ page, ctx, browser, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  // ── 1. GET THERE ────────────────────────────────────────────────────────
  const call = await ensureCall(page);
  if (!call.id) { out.leftToDo = 'Could not start a call as the host — follow the written steps by hand.'; return out; }

  const bob = await attach('bob');
  const carol = await attach('carol');
  await full({ page, ctx, browser }); await full(bob); await full(carol);
  await closePeople(bob.page); await closeSideRooms(bob.page);
  for (let i = 0; i < 2; i++) {
    if (!(await inCall(bob.page))) await joinCall(bob.page, call.id);
    if (!(await inCall(carol.page))) await joinCall(carol.page, call.id);
    await admitAll(page);
    if ((await inCall(bob.page)) && (await inCall(carol.page))) break;
  }
  if (!(await inCall(carol.page))) {
    out.leftToDo = 'The third participant never got into the call — do not judge this screen. Re-run.';
    return out;
  }

  if (await inSideRoom(page)) await leaveRoom(page);          // the host belongs in the main call
  if (await inSideRoom(carol.page)) await leaveRoom(carol.page);

  let list = await rooms(page, call.id);
  if (!list.some((r) => r.name === FULL)) { await createRoom(page, FULL); await leaveRoom(page); }
  if (!(await inSideRoom(bob.page))) await joinRoom(bob.page, FULL);

  list = await rooms(page, call.id);
  const mk = { created: 'already there', left: null };
  if (!list.some((r) => r.name === EMPTY)) {
    Object.assign(mk, await createRoom(page, EMPTY));
    mk.left = await leaveRoom(page);          // step 1: created, then left so it stays empty
  } else if (await inSideRoom(page)) {
    mk.left = await leaveRoom(page);
  }
  progress(1);                       // step 1: a brand new room, created and left empty

  await tile({ page, ctx, browser }, 0, 1);
  await openSideRooms(page);
  await openPeople(page);
  await closeMenus(page);

  // ── 2. PROVE IT ─────────────────────────────────────────────────────────
  list = await rooms(page, call.id);
  const fullRoom = list.find((r) => r.name === FULL);   // not `full` — that is the imported window helper
  const empty = list.find((r) => r.name === EMPTY);
  const seats = await panel(page);
  out.asserted = {
    meeting: call.id,
    rooms: list.map((r) => `${r.name} status=${r.status} count=${r.count}`),
    hostInsideRoom: await inSideRoom(page),
    emptyRoomSetup: mk,
    menuTargetInMainCall: (seats.rows || []).some((r) => r.includes(NAME.carol)),
  };

  if (!(fullRoom && fullRoom.count >= 1 && empty && empty.count === 0
        && !out.asserted.hostInsideRoom && out.asserted.menuTargetInMainCall)) {
    out.leftToDo = 'Setup did not reach the state this finding needs — do not judge this screen. '
                 + `It needs "${FULL}" with somebody in it and "${EMPTY}" empty, with the host and `
                 + 'QA Carol both in the main call. Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 3. HAND OVER ────────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 1;   // step 1 done: the empty room was created and left empty
  out.leftToDo =
    `The Side Rooms panel lists both rooms: "${FULL}" with one person in it and "${EMPTY}", `
    + 'which is empty. In the Participants panel, open Participant actions on '
    + `QA Carol and read the MOVE TO SIDE ROOM section: it offers "Move to ${FULL}" and nothing `
    + `else — "${EMPTY}" is missing, although its own card in the Side Rooms panel has a working `
    + 'Join button. Optional second look: have QA Carol join the empty room from that card, then '
    + 'open the same menu again and the room appears.';
  return out;
};
