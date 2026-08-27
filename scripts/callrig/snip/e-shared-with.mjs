/* Repro: the recipient's file card says the file is shared with nobody — although they can
 * see it precisely because it was sent into a channel they are in.
 * Report: lane E, "[FE-WEB][FILES] Получателю написано, что файл никому не отправлен…"
 *
 * Driven from alice, the RECIPIENT. It drives the second account's browser to send a file into
 * a channel they share, then opens the file's details on this side — you read SHARED WITH.
 */
import { DOM } from './lib.mjs';
import { second } from './e-rig2.mjs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const WS = 'W4QEF1XTURESO01', GEN = 'C4QEGENERAL0001';

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const name = 'e-shared-' + Date.now().toString(36).slice(-5) + '.txt';
  const local = path.join(os.homedir(), '.cache', 'aloqa-callrig', name);
  fs.writeFileSync(local, 'lane E shared-file repro\n');

  // step 1 — the other account sends a file into a channel this account is in
  let sender = null;
  const rig = await second('E', 'bob');
  try {
    await rig.page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`, { waitUntil: 'domcontentloaded' });
    await rig.page.waitForTimeout(4000);
    await rig.page.evaluate(DOM);
    await rig.page.evaluate(() => window.__qa.clickDeepest(/^Attach files$/));
    await rig.page.waitForTimeout(2500);
    await rig.page.evaluate(DOM);
    // "Attach files" opens the library picker; uploading there puts the file in the library,
    // and it still has to be selected and attached before the message is sent.
    await rig.page.locator('[role=dialog] input[type=file]').last().setInputFiles(local);
    await rig.page.waitForTimeout(6000);
    await rig.page.evaluate(DOM);
    await rig.page.evaluate((n) => {
      const d = [...document.querySelectorAll('[role=dialog]')].filter((x) => window.__qa.boxVis(x)).pop();
      window.__qa.clickDeepest(new RegExp(n.replace('.', '\\.')), d);
    }, name);
    await rig.page.waitForTimeout(1500);
    await rig.page.evaluate(DOM);
    await rig.page.evaluate(() => {
      const d = [...document.querySelectorAll('[role=dialog]')].filter((x) => window.__qa.boxVis(x)).pop();
      const b = [...d.querySelectorAll('button')].find((x) => /^Attach selected/.test(window.__qa.nameOf(x)));
      if (b && !b.disabled) b.click();
    });
    await rig.page.waitForTimeout(2500);
    await rig.page.evaluate(DOM);
    await rig.page.evaluate(() => window.__qa.clickDeepest(/^Send$/));
    await rig.page.waitForTimeout(6000);
    sender = await rig.page.evaluate(async ({ ws, n }) => {
      const j = await (await fetch(`/api/v1/users/me/files?workspace_id=${ws}&scope=own&limit=50`,
        { credentials: 'include' })).json();
      const f = (j.files || []).find((x) => x.filename === n);
      return f ? { id: f.id, filename: f.filename, shared_with: f.shared_with, context_id: f.context_id }
               : { none: true };
    }, { ws: WS, n: name });
  } finally {
    await rig.browser.close().catch(() => {});
    try { fs.unlinkSync(local); } catch { /* nothing to clean */ }
  }
  if (!sender || !sender.id || !(sender.shared_with || []).some((s) => s.target_id === GEN)) {
    out.asserted = { sender };
    out.leftToDo = 'The other account did not manage to send the file into the shared channel — do '
                 + 'not judge this screen. Send one by hand and follow the steps.';
    return out;
  }
  progress(1);

  // step 2 — this account: Files -> Shared with me, right-click the file -> View details
  await page.goto(`https://airion-cargo.store/w/${WS}/files`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4500);
  await page.evaluate(DOM);
  await page.evaluate(() => window.__qa.clickDeepest(/^Shared with me$/));
  await page.waitForTimeout(4000);
  await page.evaluate(DOM);
  const box = await page.evaluate((n) => {
    const b = [...document.querySelectorAll('main button')].filter((x) => window.__qa.vis(x))
      .find((x) => window.__qa.nameOf(x).includes(n));
    if (!b) return null;
    b.scrollIntoView({ block: 'center' });
    const r = b.getBoundingClientRect();
    return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
  }, name);
  if (!box) {
    out.asserted = { sender };
    out.leftToDo = `"${name}" is not in this account's Shared with me list — do not judge this screen.`;
    return out;
  }
  await page.mouse.click(box.x, box.y, { button: 'right' });
  await page.waitForTimeout(2000);
  await page.evaluate(DOM);
  await page.evaluate(() => {
    const w = [...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=menu]')]
      .filter((x) => window.__qa.boxVis(x)).pop();
    // the menu item's text is split across nodes, so popperPick's leaf match misses it
    if (w) window.__qa.clickDeepest(/View details/i, w);
  });
  await page.waitForTimeout(3500);
  await page.evaluate(DOM);

  out.asserted = await page.evaluate(async ({ ws, n }) => {
    const panel = [...document.querySelectorAll('aside')].filter((x) => window.__qa.boxVis(x))
      .find((x) => /^Details/.test(x.innerText.trim()) && x.innerText.includes(n));
    const j = await (await fetch(`/api/v1/users/me/files?workspace_id=${ws}&scope=accessible&limit=50`,
      { credentials: 'include' })).json();
    const f = (j.files || []).find((x) => x.filename === n);
    return {
      url: location.href,
      onSharedWithMe: true,
      detailsPanelOpen: !!panel,
      detailsPanelText: panel ? panel.innerText.replace(/\n+/g, ' | ').slice(0, 300) : null,
      thisAccountsCopyOfTheFile: f ? { id: f.id, shared_with: f.shared_with, context_id: f.context_id } : null,
    };
  }, { ws: WS, n: name });
  out.asserted.file = name;
  out.asserted.senderSideOfTheSameFile = sender;

  if (!out.asserted.detailsPanelOpen) {
    out.leftToDo = 'The details panel did not open — do not judge this screen. Right-click the file '
                 + 'in Shared with me and choose View details by hand.';
    return out;
  }
  progress(2);

  out.ready = true;
  out.stepsDone = 2;   // steps 1-2 done; reading the section is step 3
  out.leftToDo = `"${name}" was just sent into a channel this account is in by the other account, `
               + `which is why it appears here under Shared with me. Its details panel is open. Read `
               + `the SHARED WITH section. For the comparison the finding asks for, open the same `
               + `file's details in the sender's own Files (My files) and read the same section there.`;
  return out;
};
