// Leave a call AND make sure the meeting is actually over.
//
// Clicking `Leave call` does not end a meeting: it stays `status: active`,
// `GET /meetings/current` keeps returning it, and every navigation bounces the
// tab back to /call/<id> — which blocks any other testing in that browser until
// the meeting ends on its own. `POST /meeting/<id>/end` is what ends it;
// `/cancel` is the wrong endpoint once the call has been answered and returns
// 409 REALTIME_CALL_NOT_RINGING.
//
//   ./d b:alice snip/leave-call.mjs
import { DOM } from './lib.mjs';

const current = (page) => page.evaluate(async () => {
  try {
    const r = await fetch('/api/v1/meetings/current', { credentials: 'include' });
    const j = await r.json();
    return j && (j.id || j.meeting_id || (j.meeting && j.meeting.id)) ? j : null;
  } catch { return null; }
});

export default async ({ page }) => {
  const out = { startedIn: page.url().includes('/call/') };
  await page.evaluate(DOM);

  // Leave through the UI first, so the normal path is what gets exercised.
  const clicked = await page.evaluate(() =>
    window.__qa.clickDeepest(/^(Leave call|Leave)$/) );
  out.leaveClicked = clicked.ok ? clicked.name : clicked.why;
  await page.waitForTimeout(2500);

  // Some flows put a confirmation in the way.
  const confirm = await page.evaluate(() =>
    window.__qa.clickDeepest(/^(Leave|Leave call|Confirm)$/) );
  if (confirm.ok) { out.confirmed = confirm.name; await page.waitForTimeout(2000); }

  let m = await current(page);
  out.activeAfterLeave = !!m;
  if (m) {
    const id = m.id || m.meeting_id || m.meeting.id;
    out.ended = await page.evaluate(async (mid) => {
      const r = await fetch(`/api/v1/meeting/${mid}/end`, { method: 'POST', credentials: 'include' });
      return { status: r.status, body: await r.text().then((t) => t.slice(0, 200)) };
    }, id);
    await page.waitForTimeout(1500);
    m = await current(page);
  }
  out.stillActive = !!m;
  return out;
};
