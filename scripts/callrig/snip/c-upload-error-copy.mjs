/* Repro — [FE-WEB][CHAT] При любой ошибке загрузки у вложения написано
 * «сервер отклонил файл».
 *
 *   ./d c:alice snip/c-upload-error-copy.mjs
 *
 * Attaches an image and makes POST /api/v1/files/upload answer 413 "file too
 * large", then sends. Playwright's interception dies with this run, so the
 * script performs the send itself and leaves the caption on screen; the toast
 * that named the real reason is captured in the measurement below.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAJUlEQVR4nGP8z4AATAxkgVGNlGpk'
          + 'wcJmxKIYD0Y1UqoRAM8oAg2/DzDQAAAAAElFTkSuQmCC';

export default async ({ page, progress }) => {
  const ws = 'W4QCF1XTURESO01', ch = 'C4QCPRIVATE0001';
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const file = path.join(os.tmpdir(), 'qa-c-upload.png');
  fs.writeFileSync(file, Buffer.from(PNG, 'base64'));

  // ── 1. GET THERE ──────────────────────────────────────────────────────
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  for (let i = 0; i < 8; i++) {
    if ((await comp.evaluate(e => e.innerText.trim())) === '') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(220);
  }
  await page.locator('input[type="file"]').first().setInputFiles([file]);
  await page.waitForTimeout(6000);
  const attached = await page.evaluate(() => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4; };
    const a = [...document.querySelectorAll('div')].filter(vis)
      .filter(e => (e.innerText || '').includes('qa-c-upload.png'))
      .sort((x, y) => (x.innerText || '').length - (y.innerText || '').length)[0];
    return a ? (a.innerText || '').replace(/\s+/g, ' ').slice(0, 80) : null;
  });
  if (!attached) {
    out.leftToDo = 'Setup did not reach the state this finding needs — the file did not attach. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }
  progress(1);                                     // step 1: file attached to a message

  // ── 2. make the upload answer 413, then send ──────────────────────────
  let intercepted = 0;
  await page.route('**/api/v1/files/upload', async (r) => {
    intercepted++;
    return r.fulfill({ status: 413, contentType: 'application/json',
      body: JSON.stringify({ code: 413, key: 'FILE_TOO_LARGE',
                             message: 'file too large', trace_id: 'qa-repro' }) });
  });
  const samples = [];
  await page.locator('button[aria-label="Send"]').first().click();
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(500);
    samples.push(await page.evaluate(() => {
      const vis = e => { const r = e.getBoundingClientRect(); return r.width > 8 && r.height > 8; };
      const caption = [...document.querySelectorAll('div,span,p')]
        .filter(e => e.children.length === 0).filter(vis)
        .map(e => (e.textContent || '').trim())
        .filter(t => /reject|unsupported|too large|network|could not|failed/i.test(t) && t.length < 70);
      const toasts = [...document.querySelectorAll('[role="status"],[role="alert"],[data-sonner-toast]')]
        .filter(vis).map(x => (x.textContent || '').trim().slice(0, 70));
      return { caption, toasts };
    }));
  }
  await page.unroute('**/api/v1/files/upload');
  progress(2);                                     // step 2: the upload failed and the send happened

  // ── 3. PROVE IT ────────────────────────────────────────────────────────
  const captions = [...new Set(samples.flatMap(s => s.caption))];
  const toasts = [...new Set(samples.flatMap(s => s.toasts))];
  out.asserted = {
    url: page.url(),
    attachmentBeforeSend: attached,
    uploadRequestsIntercepted: intercepted,
    serverAnswer: '413 {"key":"FILE_TOO_LARGE","message":"file too large"}',
    captionsUnderTheAttachment: captions,
    toastsSeen: toasts,
  };
  if (intercepted !== 1 || !captions.some(c => /rejected this file/i.test(c))) {
    out.leftToDo = 'Setup did not reach the state this finding needs — expected exactly one intercepted '
                 + 'upload and "The server rejected this file" under the attachment. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 4. HAND OVER ───────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 2;
  out.leftToDo =
    'Step 3 of the finding: read the caption under the attachment in the composer — it says '
    + `"${captions.find(c => /rejected this file/i.test(c))}", although the server said the file was `
    + 'too large, which is the one case the person could fix themselves by picking a smaller file. '
    + `The toast beside it did name the real reason: ${toasts.join(' / ') || '(already faded)'}. `
    + 'A dropped connection, a 500 and a 413 all produce that same caption.';
  return out;
};
