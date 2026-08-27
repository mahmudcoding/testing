/* Repro: Directories -> People shows neither presence nor the person's own status,
 * though both arrive in the response the list is built from.
 * Report: lane E, "[FE-WEB][DIRECTORIES] В списке People не показывается ни присутствие, ни статус…"
 *
 * Driven from alice. Brings a second account online (bob) so the list provably contains
 * both an online and an offline person, sets alice's own status to Vacation, and lands on
 * the People tab — you compare the rows with a channel's Members panel.
 */
import { DOM } from './lib.mjs';
import { second } from './e-rig2.mjs';
const WS = 'W4QEF1XTURESO01';

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  // step 1 — a second account online, a third left offline
  let rig = null;
  try {
    rig = await second('E', 'bob');
    await rig.page.evaluate(() => fetch('/api/v1/auth/me', { credentials: 'include' })).catch(() => {});
  } catch (e) {
    out.leftToDo = 'Could not bring the second account online — do not judge this screen. '
                 + 'Sign a second account in by hand, leave a third signed out, and follow the steps.';
    return out;
  } finally {
    if (rig) await rig.browser.close().catch(() => {});
  }
  await page.waitForTimeout(2500);
  progress(1);

  // step 2 — set this account's own status to Vacation, through the Profile menu
  await page.goto(`https://airion-cargo.store/w/${WS}/c/C4QEGENERAL0001`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);
  await page.evaluate(DOM);
  // Clicking Vacation when it is already Vacation CLEARS it, so a second run would
  // undo the first. Read the current status and only click when it needs changing.
  const statusNow = async () => page.evaluate(async (ws) => {
    const me = await (await fetch('/api/v1/auth/me', { credentials: 'include' })).json();
    const mem = await (await fetch(`/api/v1/workspaces/${ws}/members`, { credentials: 'include' })).json();
    const mine = (mem.members || []).find((x) => x.user_id === me.id);
    return (mine && mine.custom_status && mine.custom_status.text) || null;
  }, WS);
  let picked = 'already Vacation';
  if ((await statusNow()) !== 'Vacation') {
    await page.evaluate(() => window.__qa.clickDeepest(/^Profile /));
    await page.waitForTimeout(1600);
    await page.evaluate(DOM);
    picked = await page.evaluate(() => window.__qa.popperPick(/^Vacation$/));
    await page.waitForTimeout(2500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(800);
  }
  const statusSet = await statusNow();
  if (statusSet !== 'Vacation') {
    out.leftToDo = 'Could not set this account\'s status to Vacation — do not judge this screen. '
                 + 'Set it by hand from the Profile menu and follow the steps.';
    out.asserted = { statusSet, picked };
    return out;
  }
  progress(2);

  // step 3 — Directories -> People
  await page.goto(`https://airion-cargo.store/w/${WS}/directories?tab=people`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4500);
  await page.evaluate(DOM);

  out.asserted = await page.evaluate(async (ws) => {
    const m = document.querySelector('main') || document.body;
    const pres = await (await fetch(`/api/v1/workspaces/${ws}/presence`, { credentials: 'include' })).json();
    const list = pres.presences || [];
    const mem = await (await fetch(`/api/v1/workspaces/${ws}/members`, { credentials: 'include' })).json();
    const members = mem.members || [];
    const me = await (await fetch('/api/v1/auth/me', { credentials: 'include' })).json();
    const mine = members.find((x) => x.user_id === me.id || x.username === (me.username || ''));
    // A row is the SMALLEST visible element holding a person's name and their Message
    // button — and it must actually be row-sized. Own row carries no Call/Message, so
    // without the length cap the "smallest" match for yourself is the entire list.
    const rowFor = (n) => {
      const c = [...m.querySelectorAll('*')].filter((e) => (e.innerText || '').includes(n)
        && /Message/.test(e.innerText || '') && window.__qa.boxVis(e));
      c.sort((a, b) => a.innerText.length - b.innerText.length);
      return (c[0] && c[0].innerText.length < 60) ? c[0] : null;
    };
    const notMe = (x) => x.user_id !== me.id && x.username !== me.username;
    const online = members.find((x) => x.presence && x.presence.online && notMe(x) && x.name && rowFor(x.name));
    const offline = members.find((x) => x.presence && !x.presence.online && notMe(x) && x.name && rowFor(x.name));
    return {
      url: location.href,
      onPeopleTab: /People/.test(m.innerText) && /tab=people/.test(location.href),
      peopleRows: members.length,
      presenceOnline: list.filter((p) => p.online).length,
      presenceOffline: list.filter((p) => !p.online).length,
      responseCarriesPresence: members.filter((x) => x.presence !== undefined).length + '/' + members.length,
      myStatusInResponse: (mine && (mine.custom_status || mine.status)) || null,
      responseCarriesMyStatus: !!(mine && mine.custom_status),
      onlinePerson: online ? online.name : null,
      offlinePerson: offline ? offline.name : null,
    };
  }, WS);
  out.asserted.statusPicked = picked;

  if (!out.asserted.onPeopleTab || !out.asserted.onlinePerson || !out.asserted.offlinePerson) {
    out.leftToDo = 'Did not reach the People tab with both an online and an offline member present '
                 + '— do not judge this screen. Follow the written steps by hand.';
    return out;
  }
  progress(3);

  out.ready = true;
  out.stepsDone = 3;   // steps 1-3 done; the comparison is step 4
  out.leftToDo = `You are on Directories -> People. The server has ${out.asserted.presenceOnline} of `
               + `${out.asserted.peopleRows} members online right now — ${out.asserted.onlinePerson} is `
               + `online, ${out.asserted.offlinePerson} is not — and this account's own status is set to `
               + `Vacation. Look at those two rows, then open any channel's Members panel `
               + `(channel header -> the "N members" button) and look at the same two people there.`;
  return out;
};
