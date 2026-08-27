/* Repro — [FE-WEB][CHAT] Переключатель Send as file не влияет ни на запрос,
 * ни на результат.
 *
 *   ./d c:alice snip/c-sendasfile-noop.mjs
 *
 * Attaches an image to the composer and switches the toggle into "file" mode
 * (its label then reads "Send as photo"). Pressing Send is the human's step.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// 8x8 red PNG
const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAJUlEQVR4nGP8z4AATAxkgVGNlGpk'
          + 'wcJmxKIYD0Y1UqoRAM8oAg2/DzDQAAAAAElFTkSuQmCC';

export default async ({ page, progress }) => {
  const ws = 'W4QCF1XTURESO01', ch = 'C4QCPRIVATE0001';
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  const file = path.join(os.tmpdir(), 'qa-c-sendasfile.png');
  fs.writeFileSync(file, Buffer.from(PNG, 'base64'));

  // ── 1. GET THERE ──────────────────────────────────────────────────────
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  for (let i = 0; i < 8; i++) {
    if ((await comp.evaluate(e => e.innerText.trim())) === '') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(220);
  }
  const input = page.locator('input[type="file"]').first();
  if (!(await input.count())) {
    out.leftToDo = 'Setup did not reach the state this finding needs — no file input on the composer. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }
  await input.setInputFiles([file]);
  await page.waitForTimeout(6000);
  progress(1);                                     // step 1: image attached

  // ── 2. switch to "file" mode ──────────────────────────────────────────
  const before = await page.evaluate(() => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4; };
    const b = [...document.querySelectorAll('button[aria-label="Send as file"],button[aria-label="Send as photo"]')]
                .filter(vis)[0];
    return b ? b.getAttribute('aria-label') : null;
  });
  if (before !== 'Send as file') {
    out.asserted = { toggleLabelBefore: before };
    out.leftToDo = 'Setup did not reach the state this finding needs — the attachment toggle is not '
                 + 'offering "Send as file". Re-run, or follow the written steps by hand.';
    return out;
  }
  await page.locator('button[aria-label="Send as file"]').first().click();
  await page.waitForTimeout(2000);
  progress(2);                                     // step 2: toggle switched to file mode

  // ── 3. PROVE IT ────────────────────────────────────────────────────────
  const state = await page.evaluate(() => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4; };
    const b = [...document.querySelectorAll('button[aria-label="Send as file"],button[aria-label="Send as photo"]')]
                .filter(vis)[0];
    const send = [...document.querySelectorAll('button[aria-label="Send"]')].filter(vis)[0];
    const chip = b ? (b.closest('div')?.parentElement?.innerText || '').replace(/\s+/g, ' ').slice(0, 70) : null;
    return { toggleLabelNow: b ? b.getAttribute('aria-label') : null,
             attachmentChip: chip,
             sendEnabled: send ? !send.disabled : null };
  });

  out.asserted = { url: page.url(), toggleLabelBefore: before, ...state };
  if (state.toggleLabelNow !== 'Send as photo' || !state.sendEnabled) {
    out.leftToDo = 'Setup did not reach the state this finding needs — the toggle did not flip to '
                 + '"Send as photo" with Send enabled. Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 4. HAND OVER ───────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 2;
  out.leftToDo =
    'Step 3 of the finding: the attached image is in "file" mode — the toggle now offers to switch '
    + 'back to "Send as photo", so the file mode is the one selected. Press Send. The message arrives '
    + 'as an image with a preview, exactly as in photo mode, and the POST /messaging/messages request '
    + 'is byte-for-byte the same in both modes (only file_ids, no mode field). Send the same image '
    + 'again without touching the toggle to compare the two results side by side.';
  return out;
};
