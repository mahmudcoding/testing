/* Repro: two of the three shortcuts Help itself lists do not work inside a channel.
 * Report: lane E, "[FE-WEB][SHELL] Два из трёх горячих сочетаний, которые предлагает сам Help…"
 *
 * Presses Cmd/Ctrl+K on Files first so you can see it working, then puts you in a channel
 * with the message composer focused — you press the same combination there.
 */
import { DOM } from './lib.mjs';
const WS = 'W4QEF1XTURESO01', GEN = 'C4QEGENERAL0001';
const MAC = process.platform === 'darwin';
const K = MAC ? 'Meta+k' : 'Control+k';

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const snap = () => page.evaluate(() => ({
    bodyChildren: document.body.children.length,
    visibleDialogs: [...document.querySelectorAll('[role=dialog]')]
      .filter((x) => window.__qa.boxVis(x)).map((d) => (d.innerText || '').replace(/\n+/g, ' | ').slice(0, 60)),
    focus: (document.activeElement
      && (document.activeElement.getAttribute('aria-label') || document.activeElement.tagName)) || null,
    path: location.pathname,
  }));

  // step 1 — outside a channel, the shortcut does what Help says
  await page.goto(`https://airion-cargo.store/w/${WS}/files`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);
  await page.evaluate(DOM);
  const filesBefore = await snap();
  await page.keyboard.press(K);
  await page.waitForTimeout(2000);
  await page.evaluate(DOM);
  const filesAfter = await snap();
  const worksOnFiles = filesAfter.visibleDialogs.some((t) => /Global search/i.test(t));
  if (!worksOnFiles) {
    out.asserted = { filesBefore, filesAfter };
    out.leftToDo = 'Cmd/Ctrl+K did not open Global search on Files, so the control this finding rests '
                 + 'on is missing — do not judge this screen. Follow the steps by hand.';
    return out;
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1200);
  progress(1);

  // now the channel, with the message composer focused — that is where the finding lives
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);
  await page.evaluate(DOM);
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  if (!(await comp.count())) {
    out.leftToDo = 'No message composer on this channel — do not judge this screen. Open a channel by hand.';
    return out;
  }
  await comp.click();
  await page.waitForTimeout(800);
  await page.evaluate(DOM);
  const inChannel = await snap();

  out.asserted = {
    url: page.url(),
    onFiles_beforeShortcut: filesBefore,
    onFiles_afterShortcut: filesAfter,      // Global search opened — the positive control
    nowInChannel: inChannel,
    composerFocused: inChannel.focus === 'Compose message',
    noDialogOpenNow: inChannel.visibleDialogs.length === 0,
  };
  if (!out.asserted.composerFocused || !out.asserted.noDialogOpenNow) {
    out.leftToDo = 'The channel did not end up with the message composer focused and nothing open — '
                 + 'do not judge this screen. Click into the composer by hand and press the shortcut.';
    return out;
  }

  out.ready = true;
  out.stepsDone = 1;   // step 1 done; pressing the shortcut in the channel is step 2
  out.leftToDo = `On Files, ${MAC ? 'Cmd' : 'Ctrl'}+K opened Global search a moment ago — that already `
               + `happened, and it is the control. You are now in a channel with the cursor in the `
               + `message box. Press ${MAC ? 'Cmd' : 'Ctrl'}+K and see what opens; press Escape, click `
               + `back into the message box and press ${MAC ? 'Cmd' : 'Ctrl'}+N; then press `
               + `${MAC ? 'Cmd' : 'Ctrl'}+Shift+T. All three are listed in Help & shortcuts.`;
  return out;
};
