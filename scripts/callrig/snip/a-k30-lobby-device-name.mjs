/* Repro — BUG: the lobby device check never names the microphone or speaker it is checking.
 *
 *   ./d a:alice snip/a-k30-lobby-device-name.mjs
 *
 * Host starts a call; the second window is put in that call's pre-join lobby as a
 * person who has made no device choice yet (the state every new user is in — the
 * stored preference is cleared first, and that is asserted). The human then opens
 * Settings in the lobby device bar and reads the three pickers.
 */
import { chromium } from 'playwright';
import { rigPort } from '../rigmap.mjs';
import { DOM } from './lib.mjs';

const WS = 'W4QAF1XTURESO01';

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  // ── 1. host starts a call ───────────────────────────────────────────────
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
  await page.locator('input[aria-label="Call name"]').first().fill('QA device check');
  await page.locator('[data-testid="calls-start-entry-open"]').click();
  await page.waitForTimeout(600);
  await page.locator('[data-testid="calls-start-submit"]').click();
  await page.waitForTimeout(8000);
  const callId = (page.url().match(/\/call\/([^/?#]+)/) || [])[1] || null;
  if (!callId) { out.leftToDo = 'The call was not created — re-run.'; return out; }
  progress(1);

  // ── 2. second window into the lobby, with NO stored device choice ───────
  const bb = await chromium.connectOverCDP(`http://127.0.0.1:${rigPort('A', 'bob')}`);
  const bp = bb.contexts()[0].pages().filter(p => p.url().includes('airion-cargo.store'))[0];
  await bp.goto(`https://airion-cargo.store/w/${WS}/calls`, { waitUntil: 'commit', timeout: 90000 });
  await bp.waitForTimeout(3000);
  const cleared = await bp.evaluate(() => {
    localStorage.removeItem('aloqa-call-device-prefs');
    return localStorage.getItem('aloqa-call-device-prefs');
  });
  await bp.goto(`https://airion-cargo.store/w/${WS}/call/${callId}`, { waitUntil: 'commit', timeout: 90000 });
  await bp.waitForTimeout(9000);
  await bp.evaluate(DOM);

  // the microphone must be ON and the level meter must actually move, or the
  // screen is not doing the check this finding is about
  const micState = await bp.evaluate(() => {
    const b = [...document.querySelectorAll('[data-testid="lobby-device-bar"] button')]
      .find(e => /Microphone/i.test(e.getAttribute('aria-label') || ''));
    return b ? { label: b.getAttribute('aria-label'), state: b.getAttribute('data-state') } : null;
  });
  const widths = new Set();
  for (let i = 0; i < 24; i++) {
    widths.add(await bp.evaluate(() => {
      const m = document.querySelector('[data-testid="lobby-audio-meter"]');
      const inner = m && m.firstElementChild;
      return inner ? (inner.className.match(/w-[^\s]*/) || [null])[0] : null;
    }));
    await bp.waitForTimeout(300);
  }
  const gum = await bp.evaluate(() => (window.__gumCalls || []).map(c => JSON.stringify(c).slice(0, 120)));

  out.asserted = {
    callId,
    storedPreferenceAfterClear: cleared,          // must be null
    onLobby: await bp.evaluate(() => !!document.querySelector('[data-testid="lobby-page"]')),
    micButton: micState,                           // data-state must be "on"
    meterWidthsSeen: [...widths],                  // must be more than one value
    lobbyGetUserMedia: gum,                        // {"audio":true} = the default device
  };
  const ok = cleared === null && out.asserted.onLobby && micState && micState.state === 'on'
          && widths.size > 1;
  if (!ok) {
    out.leftToDo = 'The second window did not reach a working lobby device check (mic off, meter '
                 + 'flat, or wrong screen) — do not judge this screen. Re-run.';
    await bb.close().catch(() => {});
    return out;
  }
  progress(2);
  await bb.close().catch(() => {});

  out.ready = true;
  out.stepsDone = 2;
  out.leftToDo = 'Look at the second window: it is in the pre-join lobby, the microphone is on and '
               + 'the level meter under DEVICE CHECK is moving. Click "Settings" in the row of '
               + 'device buttons and read the three pickers. They say "Select microphone", '
               + '"Select speaker", "Select camera" — none names the device being metered, and '
               + 'opening the microphone list shows no option marked as chosen.';
  return out;
};
