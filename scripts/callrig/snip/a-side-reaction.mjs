/* Repro: a live reaction sent from inside a Side Room bursts on the sender's tile
 * in the MAIN call, where people who never entered the room can see it.
 * Report: lane A, "[FE-WEB][CALLS][SIDE ROOMS] Реакция, отправленная внутри Side Room,
 * показывается всем в главном звонке"
 *
 *   ./d a:bob snip/a-side-reaction.mjs
 *
 * Driven from QA Bob's window, because he is the one who presses the reaction.
 * The host and the third participant are put in the main call and tiled beside him.
 */
import { attach, ensureCall, joinCall, admitAll, inCall, rooms, createRoom, joinRoom,
         leaveRoom, inSideRoom, closePeople, closeSideRooms, tile, full, install } from './a-callkit.mjs';

const ROOM = 'Room A';

export default async ({ page, ctx, browser, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const me = { page, ctx, browser };                 // QA Bob — the sender

  // ── 1. GET THERE ────────────────────────────────────────────────────────
  const alice = await attach('alice');               // host
  const carol = await attach('carol');               // third participant, stays in the main call
  await full(me); await full(alice); await full(carol);   // an earlier run may have left them narrow
  const call = await ensureCall(alice.page);
  if (!call.id) { out.leftToDo = 'Could not start a call as the host — follow the written steps by hand.'; return out; }

  for (let i = 0; i < 2; i++) {
    if (!(await inCall(page))) await joinCall(page, call.id);
    if (!(await inCall(carol.page))) await joinCall(carol.page, call.id);
    await admitAll(alice.page);
    if ((await inCall(page)) && (await inCall(carol.page))) break;
  }
  if (!(await inCall(page)) || !(await inCall(carol.page))) {
    out.leftToDo = 'Not everyone got into the call — do not judge this screen. Re-run.';
    return out;
  }

  // the two observers belong in the main call, the sender inside the room
  if (await inSideRoom(alice.page)) await leaveRoom(alice.page);
  if (await inSideRoom(carol.page)) await leaveRoom(carol.page);
  if (!(await rooms(alice.page, call.id)).some((r) => r.name === ROOM)) {
    await createRoom(alice.page, ROOM);
    await leaveRoom(alice.page);
  }
  if (!(await inSideRoom(page))) await joinRoom(page, ROOM);
  progress(1);                       // step 1: three in the call, one of them inside a side room

  await closePeople(page);
  await closePeople(alice.page);
  await closePeople(carol.page);
  await closeSideRooms(page);
  await closeSideRooms(alice.page);

  // ── 2. PROVE IT ─────────────────────────────────────────────────────────
  // Read where everybody is BEFORE tiling. "Leave Side Room" lives in the call
  // header and drops out of a narrow window, so the same probe run after tiling
  // reports a participant who is demonstrably inside a room as not in one.
  const where = {
    rooms: (await rooms(alice.page, call.id)).map((r) => `${r.name} ${r.status} ${r.count}`),
    senderInsideRoom: await inSideRoom(page),
    hostInMainCall: !(await inSideRoom(alice.page)) && (await inCall(alice.page)),
    thirdInMainCall: !(await inSideRoom(carol.page)) && (await inCall(carol.page)),
  };

  // Two tiles, not three: at a third of a 1920px screen the call header and the
  // whole toolbar are gone, so the reaction button is not there to be clicked.
  await tile(alice, 1, 2);
  await tile(me, 0, 2);
  await install(page);

  out.asserted = {
    meeting: call.id,
    ...where,
    sendReactionButton: await page.evaluate(() =>
      [...document.querySelectorAll('button')].filter(window.__qa.vis)
        .some((b) => /^Send reaction$/.test(window.__qa.nameOf(b).trim()))),
  };

  if (!(out.asserted.senderInsideRoom && out.asserted.hostInMainCall
        && out.asserted.thirdInMainCall && out.asserted.sendReactionButton)) {
    out.leftToDo = 'Setup did not reach the state this finding needs — do not judge this screen. '
                 + 'It needs the sender inside the side room and the other two in the main call. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 3. HAND OVER ────────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 1;   // step 1 done: the side room exists and the sender is inside it
  out.leftToDo =
    `Two windows are tiled: QA Bob on the left — he is inside "${ROOM}" — and QA Alice on the `
    + 'right, still in the main call along with QA Carol, whose window is behind them. '
    + 'On the LEFT window click "Send reaction" in the call toolbar and pick any emoji. Within '
    + 'about five seconds the same emoji bursts on his tile in the RIGHT window, which is the main '
    + 'call, although nobody there entered the room. Control, worth doing straight after: send a '
    + 'reaction from the RIGHT window instead — it shows in the main call and does NOT reach the '
    + 'left one, so the boundary does work in the other direction.';
  return out;
};
