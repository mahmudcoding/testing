/* Repro: picking a named microphone in the in-call device panel does nothing —
 * the row is never ticked, the published track stays on the system default.
 * Report: lane A, "[FE-WEB][CALLS] Выбор микрофона в звонке не переключает микрофон:
 * звук уходит на системный по умолчанию, а в списке отмеченным остаётся прежний"
 *
 *   ./d a:alice snip/a-mic-select.mjs
 *
 * Gets into a call with the microphone on, wipes the stored device preference so
 * the list starts with nothing ticked, then ticks the "System default" row and
 * proves the tick moved. That is the control: this list does tick. Picking a
 * named microphone is yours.
 */
import { ensureCall, install, closePeople, tile } from './a-callkit.mjs';

const TRACK = `(async () => {
  const out = [];
  for (const pc of (window.__pcs || [])) {
    if (pc.connectionState === 'closed') continue;
    for (const s of pc.getSenders()) {
      if (s.track && s.track.kind === 'audio') {
        const st = s.track.getSettings();
        out.push({ label: s.track.label, deviceId: String(st.deviceId || '').slice(0, 20) });
      }
    }
  }
  return out;
})()`;

// The device list lives in a Radix popper. Do NOT widen this to [role=dialog]:
// the in-call overlay is itself role=dialog, so it wins .pop() and the probe
// comes back with an empty row list that reads exactly like "the panel is open
// and has no devices in it".
const ROWS = `(() => {
  const w = [...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=menu]')]
    .filter(window.__qa.boxVis)
    .filter((n) => n.querySelector('button[data-selected]')).pop();
  if (!w) return null;
  return [...w.querySelectorAll('button[data-selected]')].filter(window.__qa.boxVis)
    .map((n) => ({ text: (n.innerText || '').replace(/\\s+/g, ' ').trim().slice(0, 60),
                   selected: n.getAttribute('data-selected') }));
})()`;

const PICK = `(want) => {
  const w = [...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=menu]')]
    .filter(window.__qa.boxVis)
    .filter((n) => n.querySelector('button[data-selected]')).pop();
  if (!w) return null;
  const b = [...w.querySelectorAll('button[data-selected]')]
    .find((n) => new RegExp(want).test(n.innerText || ''));
  if (!b) return null;
  b.scrollIntoView({ block: 'center' });
  const r = b.getBoundingClientRect();
  return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
}`;

export default async ({ page, ctx, browser, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  // ── 1. GET THERE ────────────────────────────────────────────────────────
  const call = await ensureCall(page);
  if (!call.id) { out.leftToDo = 'Could not get into a call — follow the written steps by hand.'; return out; }

  // start from no stored device preference, so the control below really is one
  await page.evaluate(() => localStorage.removeItem('aloqa-call-device-prefs'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  await tile({ page, ctx, browser }, 0, 1);      // full width: a narrow window hides the toolbar
  await closePeople(page);
  await install(page);

  const inputs = await page.evaluate(async () => (await navigator.mediaDevices.enumerateDevices())
    .filter((d) => d.kind === 'audioinput').map((d) => d.label));
  const micName = () => page.evaluate(() => {
    const b = [...document.querySelectorAll('button')]
      .find((x) => /^(Mute|Unmute)$/.test(window.__qa.nameOf(x).trim()));
    return b ? window.__qa.nameOf(b).trim() : null;
  });
  if ((await micName()) === 'Unmute') {          // step 1 says "with the microphone on"
    await page.evaluate(() => window.__qa.clickDeepest(/^Unmute$/));
    await page.waitForTimeout(2500);
  }
  progress(1);                        // step 1: several inputs on the machine, in a call, mic on

  const openPanel = async () => {
    await install(page);
    let rows = await page.evaluate(ROWS);
    if (rows && rows.length) return rows;
    await page.locator('button[aria-label="Select microphone"]').first().click({ timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2200);
    await install(page);
    rows = await page.evaluate(ROWS);
    return rows && rows.length ? rows : null;
  };
  const fresh = await openPanel();
  if (!fresh) {
    out.leftToDo = 'The Select microphone panel did not open — do not judge this screen. '
                 + 'Re-run, or open it by hand from the call toolbar.';
    return out;
  }

  // CONTROL: tick "System default" and watch the tick actually arrive
  const hit = await page.evaluate(`(${PICK})('System default device')`);
  if (hit) { await page.mouse.click(hit.x, hit.y); await page.waitForTimeout(3000); }
  const rows = (await openPanel()) || [];

  // ── 2. PROVE IT ─────────────────────────────────────────────────────────
  // MICROPHONE comes first, SPEAKER second, and both sections carry "Device ID"
  // rows — cut at the second "System default device" row so the example named
  // below is a microphone and not a speaker.
  const cut = rows.findIndex((r, i) => i > 0 && /System default/.test(r.text));
  const micRows = cut > 0 ? rows.slice(0, cut) : rows;
  const named = micRows.filter((r) => /Device ID/.test(r.text));
  const tickedBefore = fresh.filter((r) => r.selected === 'true').map((r) => r.text);
  const ticked = rows.filter((r) => r.selected === 'true').map((r) => r.text);
  out.asserted = {
    meeting: call.id,
    audioInputs: inputs,
    micButton: await micName(),
    tickedBeforeControl: tickedBefore,
    tickedAfterControl: ticked,
    controlMovedTheTick: tickedBefore.length === 0
      && ticked.some((t) => /System default device/.test(t)),
    namedMicRows: named.map((r) => r.text),
    publishedTrack: await page.evaluate(TRACK),
    storedPref: await page.evaluate(() => localStorage.getItem('aloqa-call-device-prefs')),
  };

  if (!(inputs.length >= 2 && named.length >= 1 && out.asserted.controlMovedTheTick)) {
    out.leftToDo = 'Setup did not reach the state this finding needs — do not judge this screen. '
                 + 'It needs at least two audio inputs, and the control click on the '
                 + '"System default" microphone row has to visibly tick it. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 3. HAND OVER ────────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 1;   // step 1 done: in the call, microphone on, several inputs present
  out.leftToDo =
    'The Select microphone panel is open. Nothing was ticked when it opened; the top MICROPHONE '
    + 'row ("System default device") was then clicked and took the tick — that is the control, '
    + 'this list does tick. Now click a NAMED microphone below it, a row showing a "Device ID" — '
    + `for example "${named[0].text.split(' Device ID')[0]}". The tick does not move to it. `
    + 'For a second control, click a row in the SPEAKER section lower down: that one moves.';
  return out;
};
