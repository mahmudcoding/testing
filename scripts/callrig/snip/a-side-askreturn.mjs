/* Repro: "Ask to return to main room" tells the host it was sent and shows the
 * participant nothing at all.
 * Report: lane A, "[FE-WEB][CALLS][SIDE ROOMS] Действие «Ask to return to main room»
 * не работает ни для кого: залогиненному участнику ничего не показывают,
 * для гостя запрос падает с 403"
 *
 *   ./d a:alice snip/a-side-askreturn.mjs
 *
 * Puts QA Bob inside a side room on a freshly reloaded client, tiles both
 * windows, and leaves you the menu item — with a neighbouring action of the
 * same class as the control.
 */
import { attach, ensureCall, joinCall, admitAll, inCall, rooms, createRoom, joinRoom,
         leaveRoom, inSideRoom, openRowMenu, closeMenus, closePeople, openPeople,
         closeSideRooms, tile, full, install, NAME } from './a-callkit.mjs';

const ROOM = 'Room A';

export default async ({ page, ctx, browser, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const host = { page, ctx, browser };

  // ── 1. GET THERE ────────────────────────────────────────────────────────
  const call = await ensureCall(page);
  if (!call.id) { out.leftToDo = 'Could not start a call as the host — follow the written steps by hand.'; return out; }

  const bob = await attach('bob');
  // A 960px window with the Participants panel open covers the call toolbar, and
  // every toolbar click then times out with "participants-list intercepts pointer
  // events" — which reads as the product refusing to open Side Rooms. Widen and
  // clear the panels before touching anything.
  await full(host); await full(bob);
  await closePeople(bob.page); await closeSideRooms(bob.page);
  for (let i = 0; i < 2 && !(await inCall(bob.page)); i++) {
    await joinCall(bob.page, call.id);
    await admitAll(page);
  }
  if (!(await inCall(bob.page))) {
    out.leftToDo = 'The second participant never got into the call — do not judge this screen. Re-run.';
    return out;
  }

  // a room to go into; the host must not be in it, the participant must be
  let list = await rooms(page, call.id);
  if (!list.some((r) => r.name === ROOM)) {
    await createRoom(page, ROOM);
    await leaveRoom(page);                    // the creator lands inside it
  } else if (await inSideRoom(page)) {
    await leaveRoom(page);
  }
  if (!(await inSideRoom(bob.page))) await joinRoom(bob.page, ROOM);
  progress(1);                       // step 1: side room made, the participant is inside it

  // his screen has to start clean, or a leftover banner is mistaken for the prompt
  await bob.page.reload({ waitUntil: 'domcontentloaded' });
  await bob.page.waitForTimeout(9000);
  await install(bob.page);
  await tile(bob, 1, 2);
  await tile(host, 0, 2);
  await closePeople(bob.page);
  await openPeople(page);
  await closeMenus(page);

  // ── 2. PROVE IT ─────────────────────────────────────────────────────────
  list = await rooms(page, call.id);
  const menu = await openRowMenu(page, NAME.bob);
  await closeMenus(page);
  out.asserted = {
    meeting: call.id,
    rooms: list.map((r) => `${r.name} ${r.status} ${r.count}`),
    participantInsideRoom: await inSideRoom(bob.page),
    hostInsideRoom: await inSideRoom(page),
    participantScreenIsClear: await bob.page.evaluate(() =>
      !/asked you|return to the main room/i.test(document.body.innerText || '')),
    menuOnParticipant: menu.items,
    askReturnPresent: menu.items.includes('Ask to return to main room'),
    // the neighbouring "Ask …" action in the same menu is the control: both the
    // camera one and the unmute one put a visible line on the participant's screen
    controlItem: menu.items.find((i) => /^Ask .+ to (turn on camera|unmute)$/.test(i)) || null,
  };

  if (!(out.asserted.participantInsideRoom && !out.asserted.hostInsideRoom
        && out.asserted.askReturnPresent && out.asserted.participantScreenIsClear
        && out.asserted.controlItem)) {
    out.leftToDo = 'Setup did not reach the state this finding needs — do not judge this screen. '
                 + 'It needs the participant inside a side room, the host in the main call, and '
                 + 'nothing already on the participant\'s screen, and a neighbouring "Ask …" '
                 + 'action in the menu to use as the control. Re-run, or follow the steps by hand.';
    return out;
  }

  // ── 3. HAND OVER ────────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 1;   // step 1 done: room created, QA Bob is inside it
  out.leftToDo =
    `Two windows are tiled: QA Alice (host, in the main call) on the left, QA Bob (inside "${ROOM}") `
    + 'on the right; his window was reloaded a moment ago and carries no message. '
    + 'On the LEFT window open Participant actions on QA Bob. Do the control first: '
    + `click "${out.asserted.controlItem}" and watch the RIGHT window — a line saying `
    + '"QA Alice asked you to turn on your …" appears there within a few seconds. '
    + 'Then re-open the same menu and click "Ask to return to main room". The host gets '
    + '"Asked QA Bob to return to the main room"; nothing appears on the right window at all.';
  return out;
};
