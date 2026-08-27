/* Repro — [FE-WEB][CHAT] Композер предлагает выбрать файлы, которые затем
 * отвергает как неподдерживаемые.
 *
 *   ./d c:alice snip/c-accept-rejects.mjs
 *
 * Attaches a .md file — one the composer's own file dialog offers, because its
 * accept list contains text/* — and leaves the rejection on screen.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export default async ({ page, progress }) => {
  const ws = 'W4QCF1XTURESO01', ch = 'C4QCPRIVATE0001';
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  const file = path.join(os.tmpdir(), 'qa-c-notes.md');
  fs.writeFileSync(file, '# QA notes\n\n- one\n- two\n');

  // ── 1. GET THERE ──────────────────────────────────────────────────────
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  for (let i = 0; i < 8; i++) {
    if ((await comp.evaluate(e => e.innerText.trim())) === '') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(220);
  }
  const accept = await page.evaluate(() => {
    const i = document.querySelector('input[type="file"]');
    return i ? i.getAttribute('accept') : null;
  });
  if (!accept) {
    out.leftToDo = 'Setup did not reach the state this finding needs — no file input on the composer. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }
  progress(1);                                     // step 1: channel open

  // ── 2. attach the file the dialog offers ──────────────────────────────
  await page.locator('input[type="file"]').first().setInputFiles([file]);
  await page.waitForTimeout(6000);
  progress(2);                                     // step 2: .md attached

  // ── 3. PROVE IT ────────────────────────────────────────────────────────
  const state = await page.evaluate(() => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4; };
    const send = [...document.querySelectorAll('button[aria-label="Send"]')].filter(vis)[0];
    const chipText = [...document.querySelectorAll('div,span,p')]
      .filter(e => e.children.length === 0 && /unsupported|not supported|reject/i.test(e.textContent || ''))
      .filter(vis).map(e => (e.textContent || '').trim().slice(0, 80));
    const area = [...document.querySelectorAll('div')].filter(vis)
      .filter(e => (e.innerText || '').includes('qa-c-notes.md'))
      .sort((a, b) => (a.innerText || '').length - (b.innerText || '').length)[0];
    return { captionsMentioningRejection: [...new Set(chipText)],
             attachmentArea: area ? (area.innerText || '').replace(/\s+/g, ' ').slice(0, 100) : null,
             sendDisabled: send ? send.disabled : null };
  });

  out.asserted = { url: page.url(), fileDialogAccept: accept,
                   acceptCoversTextFiles: /text\/\*/.test(accept), ...state };
  if (!state.attachmentArea || state.sendDisabled !== true) {
    out.leftToDo = 'Setup did not reach the state this finding needs — the attachment is not on screen '
                 + 'with Send disabled. Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 4. HAND OVER ───────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 2;
  out.leftToDo =
    'Step 3 of the finding: read the caption under the attachment in the composer — '
    + `"${state.attachmentArea}" — and look at the Send button, which is now disabled. The file `
    + `dialog that offered this file lists accept="${accept}", which covers every text file, so the `
    + 'composer proposed exactly the file it then refuses. A .bmp image and a .log file behave the '
    + 'same way.';
  return out;
};
