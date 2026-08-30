/* Repro — BUG: the guest invite page never says the call is being recorded.
 *
 *   ./d a:alice snip/a-k30-guest-recording.mjs
 *
 * Sets up a recording call as the host, reads the guest link out of "Add to call",
 * and parks a SIGNED-OUT window on the guest invite page. The human then types a
 * name and presses Join, and watches the Recording badge appear only after entry.
 *
 * The second window is signed out on purpose (ctx.clearCookies) — a signed-in
 * member opening a guest link is redirected to the member lobby and never sees
 * the guest page at all. Re-sign it afterwards with ./ensure.sh A carol.
 */
import { chromium } from 'playwright';
import { rigPort } from '../rigmap.mjs';
import { DOM } from './lib.mjs';

const WS = 'W4QAF1XTURESO01';

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  // ── 1. GET THERE — host starts a call and starts recording ──────────────
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, { waitUntil: 'commit', timeout: 90000 });
  await page.waitForTimeout(2000);
  await page.evaluate(async (w) => {
    const r = await fetch(`/api/v1/workspace/${w}/meetings/active`, { credentials: 'include' });
    const j = await r.json().catch(() => ({}));
    for (const m of (j.meetings || [])) {
      await fetch(`/api/v1/meeting/${m.id}/end`, { method: 'POST', credentials: 'include' });
    }
  }, WS);
  await page.waitForTimeout(2500);
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, { waitUntil: 'commit', timeout: 90000 });
  await page.waitForTimeout(4000);
  await page.locator('[data-testid="calls-hub-start-now"]').click();
  await page.waitForTimeout(2000);
  await page.locator('input[aria-label="Call name"]').first().fill('QA recording repro');
  await page.locator('[data-testid="calls-start-entry-open"]').click();
  await page.waitForTimeout(600);
  await page.locator('[data-testid="calls-start-submit"]').click();
  await page.waitForTimeout(8000);
  const callId = (page.url().match(/\/call\/([^/?#]+)/) || [])[1] || null;
  if (!callId) {
    out.leftToDo = 'The call was not created — do not judge this screen. Re-run.';
    return out;
  }
  await page.evaluate(DOM);
  await page.locator('[data-testid="recording-start-access-trigger"]').click();
  await page.waitForTimeout(2000);
  await page.locator('button', { hasText: /^Start recording$/ }).first().click();
  await page.waitForTimeout(6000);

  const rec = await page.evaluate(async (id) => {
    const r = await fetch(`/api/v1/meeting/${id}/recordings`, { credentials: 'include' });
    const j = await r.json().catch(() => ({}));
    const a = (j.recordings || []).find(x => x.status === 'recording');
    return a ? { id: a.id, status: a.status, started_at: a.started_at } : null;
  }, callId);
  if (!rec) {
    out.leftToDo = 'Recording did not start — the finding needs an actively recording call. Re-run.';
    return out;
  }
  progress(1);

  // ── 2. the guest link, read from the host's "Add to call" ───────────────
  await page.locator('[data-testid="call-controls-add-to-call"]').click();
  await page.waitForTimeout(2500);
  const link = await page.evaluate(() => {
    const i = [...document.querySelectorAll('input')].find(e => /\/join\//.test(e.value || ''));
    return i ? i.value : null;
  });
  await page.keyboard.press('Escape');
  if (!link) {
    out.leftToDo = 'The guest link was not found in Add to call — re-run.';
    return out;
  }
  progress(2);

  // ── 3. park a SIGNED-OUT window on the guest invite page ────────────────
  const gb = await chromium.connectOverCDP(`http://127.0.0.1:${rigPort('A', 'carol')}`);
  const gctx = gb.contexts()[0];
  const gp = gctx.pages().filter(p => p.url().includes('airion-cargo.store'))[0] || await gctx.newPage();
  await gctx.clearCookies();
  await gp.goto(link, { waitUntil: 'commit', timeout: 90000 });
  await gp.waitForTimeout(9000);
  await gp.evaluate(DOM);

  const landing = await gp.evaluate(() => {
    const q = window.__qa;
    const vis = [...document.querySelectorAll('*')].filter(e => q.vis(e));
    const doc = document.body.innerText || '';
    return {
      url: location.pathname,
      anonymous: true,
      docText: doc.replace(/\n{2,}/g, '\n'),
      nameField: [...document.querySelectorAll('input[type=text]')].filter(e => q.vis(e)).length,
      mentionsRecording: /record/i.test(doc),
      recordingAttrs: vis.filter(e => /record|consent/i.test(
        (e.getAttribute('data-testid') || '') + (e.getAttribute('aria-label') || ''))).length,
      controlInvited: /invited/i.test(doc),   // positive control for the same probe
    };
  });
  const authed = await gp.evaluate(async () => (await fetch('/api/v1/auth/me', { credentials: 'include' })).status);

  out.asserted = {
    callId,
    recording: rec,
    guestPageUrl: landing.url,
    guestIsAnonymous: authed === 401,
    guestPageText: landing.docText,
    nameFieldPresent: landing.nameField === 1,
    mentionsRecording: landing.mentionsRecording,
    recordingAttrCount: landing.recordingAttrs,
    probeWorks_findsWordInvited: landing.controlInvited,
  };

  const ok = /\/join\//.test(landing.url) && authed === 401 && landing.nameField === 1 && landing.controlInvited;
  if (!ok) {
    out.leftToDo = 'The signed-out window did not reach the guest invite page (or the probe could not '
                 + 'read it) — do not judge this screen. Re-run, then ./ensure.sh A carol.';
    await gb.close().catch(() => {});
    return out;
  }
  progress(3);
  await gb.close().catch(() => {});

  out.ready = true;
  out.stepsDone = 3;
  out.leftToDo = 'Look at the second window — it is signed out and sitting on the guest invite page for '
               + 'a call that IS being recorded right now. It offers a name field and Join, and says '
               + 'nothing about recording. Type any name and press "Join call": the red "Recording" '
               + 'badge and "This call is being recorded" appear only once you are already inside. '
               + 'Afterwards run  ./ensure.sh A carol  to sign that window back in.';
  return out;
};
