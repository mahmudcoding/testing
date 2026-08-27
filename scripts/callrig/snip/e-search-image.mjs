/* Repro: an image opened from a search result is not shown — "Preview is not available
 * for this file type" — while the same file opened from Files renders.
 * Report: lane E, "[FE-WEB][SEARCH] Картинка, открытая из результата поиска, не показывается…"
 *
 * Uploads a small PNG, opens it from Files so you see the viewer working, then puts the same
 * file's name into Global search — you click the result.
 */
import { DOM, safeClick } from './lib.mjs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const WS = 'W4QEF1XTURESO01', CO = 'O4QEF1XTURESO01';
// a 64x64 PNG, 148 bytes
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAWklEQVR42u3OMQEAAAgDoJnc6Bpj'
  + 'DyQgdpJKr3sBAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECDgLLBnUAFB9jK6TQAAAABJRU5ErkJggg==', 'base64');

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const name = 'e-preview-' + Date.now().toString(36).slice(-5) + '.png';
  const local = path.join(os.homedir(), '.cache', 'aloqa-callrig', name);
  fs.writeFileSync(local, PNG);

  await page.goto(`https://airion-cargo.store/w/${WS}/files`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.evaluate(DOM);

  // step 1 — upload an ordinary PNG
  try {
    await page.evaluate(() => window.__qa.clickDeepest(/^Upload$/));
    await page.waitForTimeout(2000);
    await page.locator('[role=dialog] input[type=file]').first().setInputFiles(local);
    await page.waitForTimeout(2000);
    await page.evaluate(DOM);
    await page.evaluate(() => {
      const d = [...document.querySelectorAll('[role=dialog]')].filter((x) => window.__qa.boxVis(x)).pop();
      window.__qa.clickDeepest(/^Upload \d+ file/, d);
    });
    await page.waitForTimeout(6000);
  } finally {
    try { fs.unlinkSync(local); } catch { /* nothing to clean */ }
  }
  const inLibrary = await page.evaluate(async ({ ws, n }) => {
    const j = await (await fetch(`/api/v1/users/me/files?workspace_id=${ws}&scope=own`,
      { credentials: 'include' })).json();
    const f = (j.files || []).find((x) => x.filename === n);
    return f ? { id: f.id, filename: f.filename, mime_type: f.mime_type, size: f.size } : null;
  }, { ws: WS, n: name });
  if (!inLibrary) {
    out.leftToDo = 'The PNG did not land in Files — do not judge this screen. Upload one by hand '
                 + 'and follow the steps.';
    return out;
  }
  // wait until the server's own search can find it, or step 3 has nothing to click
  let searchable = null;
  for (let i = 0; i < 12; i++) {
    searchable = await page.evaluate(async ({ n, co, ws }) => {
      const q = n.replace(/\.png$/, '');
      const j = await (await fetch(`/api/v1/search?q=${q}&company_id=${co}&workspace_id=${ws}&limit=25`,
        { credentials: 'include' })).json();
      return { total_files: j.total_files, files: (j.files || []).map((f) => f.filename || f.name) };
    }, { n: name, co: CO, ws: WS });
    if (searchable && searchable.total_files > 0) break;
    await page.waitForTimeout(2500);
  }
  progress(1);

  // step 2 — open it from Files; this is the control
  await page.goto(`https://airion-cargo.store/w/${WS}/files`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.evaluate(DOM);
  await page.evaluate(() => window.__qa.clickDeepest(/^Images/));     // keep the card above the fold
  await page.waitForTimeout(2500);
  await page.evaluate(DOM);
  const opened = await safeClick(page, `main button:has-text("${name}")`);
  await page.waitForTimeout(4000);
  await page.evaluate(DOM);
  const fromFiles = await page.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter((x) => window.__qa.boxVis(x)).pop();
    const sc = d || document.querySelector('main');
    return {
      viewerOpen: !!d,
      images: [...sc.querySelectorAll('img')].filter((i) => window.__qa.boxVis(i))
        .map((i) => ({ naturalWidth: i.naturalWidth, naturalHeight: i.naturalHeight,
                       src: (i.src || '').replace(/^https?:\/\/[^/]+/, '').slice(0, 60) })),
      text: sc.innerText.replace(/\n+/g, ' | ').slice(0, 120),
    };
  });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1500);
  if (!fromFiles.viewerOpen || !fromFiles.images.some((i) => i.naturalWidth > 0)) {
    out.asserted = { inLibrary, opened: { ok: opened.ok, reason: opened.reason }, fromFiles };
    out.leftToDo = 'The file did not render as an image from Files either, so the control this '
                 + 'finding rests on is missing — do not judge this screen.';
    return out;
  }
  progress(2);

  // step 3, first half — find the same file in Global search
  await page.evaluate(DOM);
  await page.evaluate(() => window.__qa.clickDeepest(/^Search QA Workspace/));
  await page.waitForTimeout(1500);
  const inp = page.locator('[role=dialog] input').first();
  if (!(await inp.count())) {
    out.leftToDo = 'Global search did not open — do not judge this. Open it by hand and search for '
                 + `"${name}".`;
    return out;
  }
  await inp.click();
  await inp.fill(name.replace(/\.png$/, ''));
  await page.waitForTimeout(5000);
  await page.evaluate(DOM);

  out.asserted = await page.evaluate((n) => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter((x) => window.__qa.boxVis(x)).pop();
    if (!d) return { dialogOpen: false };
    const names = [...d.querySelectorAll('button')].filter((b) => window.__qa.boxVis(b))
      .map((b) => window.__qa.nameOf(b));
    return {
      dialogOpen: true,
      counts: names.filter((x) => /^(All|Files)\d/.test(x)),
      fileResultPresent: d.innerText.includes(n),
    };
  }, name);
  out.asserted.uploadedFile = inLibrary;
  out.asserted.serverSearchFindsIt = searchable;
  out.asserted.sameFileOpenedFromFiles = fromFiles;

  if (!out.asserted.dialogOpen || !out.asserted.fileResultPresent) {
    out.leftToDo = `Global search does not list "${name}" — do not judge this screen. Search for it `
                 + 'by hand once the index catches up, then click the result.';
    return out;
  }

  out.ready = true;
  out.stepsDone = 2;   // steps 1-2 done; opening it from the search result is step 3
  out.leftToDo = `"${name}" (${inLibrary.mime_type}, ${inLibrary.size} B) was uploaded to Files and, a `
               + `moment ago, opened from Files as a real picture — the viewer showed an <img> of `
               + `${fromFiles.images[0].naturalWidth}x${fromFiles.images[0].naturalHeight}. Global search `
               + `now lists that same file. Click the file result and look at what the card shows.`;
  return out;
};
