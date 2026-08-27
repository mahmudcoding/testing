/* Repro: the host revokes someone's screen sharing and the person who was
 * sharing gets no visible message — the share simply vanishes.
 * Report: lane A, "[FE-WEB][CALLS] Отзыв демонстрации экрана не сопровождается
 * видимым сообщением тому, кто показывал"
 *
 *   ./d a:alice snip/a-revoke-share.mjs
 *
 * Puts QA Bob on a live screen share, tiles both windows, and leaves you the
 * menu — with the neighbouring mute action as the control, because that one
 * does put a line on his screen.
 */
import { attach, ensureCall, joinCall, admitAll, inCall, inSideRoom, leaveRoom,
         openRowMenu, rowAction, setDevicePermission, closeMenus, closePeople,
         closeSideRooms, openPeople, tile, full, install, NAME } from './a-callkit.mjs';

export default async ({ page, ctx, browser, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const host = { page, ctx, browser };

  // ── 1. GET THERE ────────────────────────────────────────────────────────
  const bob = await attach('bob');
  await full(host); await full(bob);          // an earlier run may have left them narrow
  const call = await ensureCall(page);
  if (!call.id) { out.leftToDo = 'Could not start a call as the host — follow the written steps by hand.'; return out; }

  for (let i = 0; i < 2 && !(await inCall(bob.page)); i++) {
    await joinCall(bob.page, call.id);
    await admitAll(page);
  }
  if (!(await inCall(bob.page))) {
    out.leftToDo = 'The participant never got into the call — do not judge this screen. Re-run.';
    return out;
  }
  if (await inSideRoom(bob.page)) await leaveRoom(bob.page);
  await closeSideRooms(bob.page);
  await closeSideRooms(page);

  // A CO-HOST cannot be moderated: Revoke screen sharing, Mute and the "Ask …"
  // items are all absent from the host's menu over one. Put him back to plain.
  let menu = await openRowMenu(page, NAME.bob);
  await closeMenus(page);
  if (menu.items.includes('Remove co-host')) {
    await rowAction(page, NAME.bob, '^Remove co-host$', 'remove-co-host-confirm-submit');
    await closeMenus(page);
  }

  // he must be allowed to share before he can be caught sharing
  const perm = await setDevicePermission(page, NAME.bob, 'Screen sharing', 'Allow');
  await closeMenus(page);
  await install(bob.page);
  const sharing = () => bob.page.evaluate(() => [...document.querySelectorAll('button')]
    .filter(window.__qa.boxVis).some((b) => /^Stop sharing$/.test(window.__qa.nameOf(b).trim())));
  if (!(await sharing())) {
    await bob.page.evaluate(() => window.__qa.clickDeepest(/^Share screen$/));
    await bob.page.waitForTimeout(7000);
    await install(bob.page);
  }
  // the report's control is "Mute <name>", which the host menu only offers while
  // he is unmuted; muted, the same slot reads "Ask … to unmute" instead
  const micName = () => bob.page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].filter(window.__qa.boxVis)
      .find((x) => /^(Mute|Unmute)$/.test(window.__qa.nameOf(x).trim()));
    return b ? window.__qa.nameOf(b).trim() : null;
  });
  if ((await micName()) === 'Unmute') {
    await bob.page.evaluate(() => window.__qa.clickDeepest(/^Unmute$/));
    await bob.page.waitForTimeout(4000);
  }
  progress(1);                       // step 1: the participant is sharing his screen

  await tile(bob, 1, 2);
  await tile(host, 0, 2);
  await closePeople(bob.page);
  await openPeople(page);
  await closeMenus(page);

  // ── 2. PROVE IT ─────────────────────────────────────────────────────────
  menu = await openRowMenu(page, NAME.bob);
  await closeMenus(page);
  out.asserted = {
    meeting: call.id,
    sharePermission: perm,
    participantIsSharing: await sharing(),
    shareButton: await bob.page.evaluate(() => {
      const b = [...document.querySelectorAll('button')]
        .find((x) => x.getAttribute('data-testid') === 'call-controls-screen-share');
      return b ? { name: window.__qa.nameOf(b).trim(), disabled: b.disabled } : null;
    }),
    participantScreenIsClear: await bob.page.evaluate(() =>
      !/A host (muted|stopped|turned off) your/i.test(document.body.innerText || '')),
    menuOnParticipant: menu.items,
    revokePresent: menu.items.includes('Revoke screen sharing'),
    participantMic: await micName(),
    controlItem: menu.items.find((i) => /^Mute /.test(i))
      || menu.items.find((i) => /^Ask .+ to unmute$/.test(i)) || null,
  };

  if (!(out.asserted.participantIsSharing && out.asserted.revokePresent
        && out.asserted.controlItem && out.asserted.participantScreenIsClear)) {
    out.leftToDo = 'Setup did not reach the state this finding needs — do not judge this screen. '
                 + 'It needs QA Bob actually sharing his screen, nothing already written on his '
                 + 'screen, and the host menu offering both Revoke screen sharing and Mute. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 3. HAND OVER ────────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 1;   // step 1 done: QA Bob is sharing his screen
  out.leftToDo =
    'Two windows are tiled: QA Alice (host) on the left, QA Bob on the right — he is sharing his '
    + 'screen and his toolbar reads "Stop sharing". On the LEFT window open Participant actions on '
    + `QA Bob and do the control first: click "${out.asserted.controlItem}". A line about what the `
    + 'host just did to his microphone appears on the RIGHT window within about ten seconds. '
    + 'Then re-open the same '
    + 'menu, click "Revoke screen sharing" and confirm. The share stops on the right window and no '
    + 'message of that kind appears; his Share screen button goes grey, and the only explanation is '
    + 'in its hover tooltip.';
  return out;
};
