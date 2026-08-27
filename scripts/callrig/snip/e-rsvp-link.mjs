/* Repro: an invitee cannot answer a meeting invitation from the notification's own link —
 * Yes/No arrive disabled and stay disabled.
 * Report: lane E, "[BE][CALENDAR] Приглашённый не может ответить на приглашение ни одним из двух путей…"
 *
 * Driven from alice (the organiser); it pulls bob's browser up itself, because the bench
 * only ever ensures alice. Ends with BOB's window in front, notifications open, the fresh
 * invitation at the top — you click the row.
 *
 * NOTE for the judge: on this build the SECOND path of the finding (grid chip -> Yes) now
 * answers 200 and the RSVP saves. Only the notification-link path is still defective.
 */
import { DOM } from './lib.mjs';
import { second, tile } from './e-rig2.mjs';
const WS = 'W4QEF1XTURESO01', BOB = 'U4QEBOB00000001';

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  // step 1 — organiser schedules a meeting and invites the second account
  const title = 'E RSVP repro ' + Date.now().toString(36).slice(-4);
  const made = await page.evaluate(async ({ ws, bob, title }) => {
    const s = new Date(Date.now() + 4 * 3600e3); s.setMinutes(0, 0, 0);
    const e = new Date(s.getTime() + 30 * 60e3);
    const r = await fetch('/api/v1/calendar/meetings', {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspace_id: ws, title, starts_at: s.toISOString(),
                             ends_at: e.toISOString(), timezone: 'Asia/Tashkent',
                             attendee_user_ids: [bob] }),
    });
    const j = await r.json().catch(() => ({}));
    const id = j.meeting && j.meeting.id;
    let attendee = null;
    if (id) {
      const d = await (await fetch('/api/v1/calendar/meetings/' + id, { credentials: 'include' })).json();
      attendee = (d.attendees || [])[0] || null;
    }
    return { status: r.status, id, organiser: (await (await fetch('/api/v1/auth/me', { credentials: 'include' })).json()).email, attendee };
  }, { ws: WS, bob: BOB, title });

  if (!made.id || !made.attendee || made.attendee.status !== 'pending') {
    out.leftToDo = 'Could not schedule the meeting with a pending invitee — do not judge this screen. '
                 + 'Create it by hand: Calendar -> New meeting, invite the second account, Schedule meeting.';
    out.asserted = made;
    return out;
  }
  progress(1);

  // step 2 — the invitee's browser: open the notifications panel
  const rig = await second('E', 'bob');
  try {
    await rig.page.goto(`https://airion-cargo.store/w/${WS}/calendar`, { waitUntil: 'domcontentloaded' });
    await rig.page.waitForTimeout(3500);
    await rig.page.evaluate(DOM);
    await rig.page.evaluate(() => window.__qa.clickDeepest(/notification/i));
    await rig.page.waitForTimeout(2500);
    await rig.page.evaluate(DOM);

    out.asserted = await rig.page.evaluate((t) => {
      const cands = [...document.querySelectorAll('[role=dialog],aside,[data-radix-popper-content-wrapper]')]
        .filter(x => window.__qa.boxVis(x));
      const p = cands.find(x => /Meeting invitation|Notifications/i.test(x.innerText));
      const rows = p ? [...p.querySelectorAll('button')].filter(b => window.__qa.boxVis(b))
        .map(b => window.__qa.nameOf(b)) : [];
      return {
        invitee: null, url: location.href,
        panelOpen: !!p,
        invitationRowForThisMeeting: rows.some(r => /Meeting invitation/.test(r) && r.includes(t)),
        topRows: rows.filter(r => /Meeting invitation/.test(r)).slice(0, 2).map(r => r.slice(0, 100)),
      };
    }, title);
    out.asserted.invitee = rig.email;
    out.asserted.meetingId = made.id;
    out.asserted.meetingTitle = title;
    out.asserted.attendeeRowOnServer = made.attendee.status;   // "pending"
    out.asserted.secondBrowser = rig.ensured;

    if (!out.asserted.panelOpen || !out.asserted.invitationRowForThisMeeting) {
      out.leftToDo = 'The invitee\'s notification panel did not show this invitation — do not judge '
                   + 'this screen. Re-run, or open the bell by hand on the second account.';
      return out;
    }
    progress(2);
    await tile(rig);                      // put the invitee's window in front — it is the one to watch
  } finally {
    await rig.browser.close().catch(() => {});   // detach CDP; the browser keeps running
  }

  out.ready = true;
  out.stepsDone = 2;   // steps 1-2 done; clicking the invitation row is step 3
  out.leftToDo = `The window in front is the INVITEE. Its notification panel is open and the top `
               + `"Meeting invitation" row is for "${title}" (the server has this invitee at status `
               + `"pending"). Click that row, then look at the Yes and No buttons under `
               + `"Your response" on the card it opens — check whether they are clickable at all. `
               + `(Step 4 of the finding — the same meeting opened from a calendar grid chip — `
               + `answers 200 on this build and the RSVP saves; only this path is still defective.)`;
  return out;
};
