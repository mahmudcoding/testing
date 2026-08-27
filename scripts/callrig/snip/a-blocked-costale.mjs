/* Repro: the BLOCKED section of the Participants panel is refreshed only on the
 * client that performed the ban — a co-host watching the same panel never sees it.
 * Report: lane A, "[FE-WEB][CALLS] Список заблокированных участников не обновляется
 * у второго модератора: бан и разбан видит только тот, кто их сделал"
 *
 *   ./d a:alice snip/a-blocked-costale.mjs
 *
 * Builds the three-way call, makes QA Bob co-host on a freshly reloaded client,
 * tiles both windows and leaves the Ban to you.
 */
import { attach, ensureCall, joinCall, admitAll, openPeople, panel, openRowMenu,
         rowAction, unbanAll, closeMenus, closeSideRooms, tile, full, inCall,
         inSideRoom, leaveRoom, NAME } from './a-callkit.mjs';

export default async ({ page, ctx, browser, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const host = { page, ctx, browser };

  const call = await ensureCall(page);
  if (!call.id) {
    out.leftToDo = 'Could not start a call as the host — follow the written steps by hand.';
    return out;
  }
  await unbanAll(page);                        // an earlier run may have left QA Carol banned

  const bob = await attach('bob');
  const carol = await attach('carol');
  await full(host); await full(bob); await full(carol);   // an earlier run may have left them narrow
  for (let round = 0; round < 2; round++) {
    if (!(await inCall(bob.page))) await joinCall(bob.page, call.id);
    if (!(await inCall(carol.page))) await joinCall(carol.page, call.id);
    await admitAll(page);
    if ((await inCall(bob.page)) && (await inCall(carol.page))) break;
  }

  // Everyone belongs in the MAIN call. Inside a side room the Participants panel
  // lists only that room's occupants, so the co-host's copy would not contain the
  // person about to be banned and the whole measurement would be of the wrong list.
  if (await inSideRoom(page)) await leaveRoom(page);
  if (await inSideRoom(bob.page)) await leaveRoom(bob.page);
  if (await inSideRoom(carol.page)) await leaveRoom(carol.page);
  await closeSideRooms(page); await closeSideRooms(bob.page);

  // the second participant becomes co-host — that is what puts BLOCKED on his panel
  const first = await panel(page);
  if (!/CO-HOST/.test((first.rows || []).find((r) => r.includes(NAME.bob)) || '')) {
    await closeMenus(page);
    await rowAction(page, NAME.bob, '^Make co-host$', 'make-host-confirm-submit');
  }
  progress(1);                       // step 1: three in the call, the second one co-host

  // his panel has to be freshly loaded, or "it never updated" is unprovable
  await bob.page.reload({ waitUntil: 'domcontentloaded' });
  await bob.page.waitForTimeout(9000);
  await openPeople(bob.page);
  await tile(bob, 1, 2);
  await tile(host, 0, 2);
  await openPeople(page);
  await closeMenus(page);

  // ── PROVE IT ────────────────────────────────────────────────────────────
  const hostPanel = await panel(page);
  const coPanel = await panel(bob.page);
  const menu = await openRowMenu(page, NAME.carol);
  await closeMenus(page);

  out.asserted = {
    meeting: call.id,
    hostRows: hostPanel.rows,
    hostBlocked: hostPanel.blocked,
    coHostRows: coPanel.rows,
    coHostBlocked: coPanel.blocked,
    coHostVisibility: coPanel.visibility,
    banInCarolMenu: menu.items.includes('Ban'),
  };

  const ok = (hostPanel.rows || []).some((r) => r.includes(NAME.carol))
    && /CO-HOST/.test((coPanel.rows || []).find((r) => r.includes(NAME.bob)) || '')
    && (coPanel.rows || []).some((r) => r.includes(NAME.carol))
    && coPanel.blocked === 'BLOCKED (0)'
    && out.asserted.banInCarolMenu;
  if (!ok) {
    out.leftToDo = 'Setup did not reach the state this finding needs — do not judge this screen. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── HAND OVER ───────────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 1;   // step 1 done: three in the call, QA Bob is co-host
  out.leftToDo =
    'Two windows are tiled: QA Alice (host) on the left, QA Bob (co-host) on the right. '
    + "Both have the Participants panel open, and QA Bob's copy was reloaded a moment ago, "
    + 'so his BLOCKED (0) is a correct starting state. '
    + 'On the LEFT window: Participant actions on QA Carol -> Ban -> confirm. '
    + 'Then watch the RIGHT window: QA Carol leaves his participant list within about '
    + '8 seconds, but his BLOCKED section stays at (0). Reload the right window and it '
    + 'reads BLOCKED (1) immediately.';
  return out;
};
