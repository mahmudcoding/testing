/* Repro: after the realtime connection drops and comes back, Calendar does not catch up on
 * what it missed.
 * Report: lane E, "[FE-WEB][CALENDAR][FILES] После разрыва связи Calendar и Files не догоняют…"
 *
 * Opens Calendar, drops the websocket (HTTP keeps working), has a second account schedule a
 * meeting and invite this one, then restores the connection and waits for the Reconnecting…
 * banner to clear — you look at the grid.
 *
 * The break is done by refusing the websocket handshake, so the page believes it is online and
 * one connection dies: that is the finding's own mechanism, and it is not the same code path as
 * a browser-offline break.
 */
import { DOM } from './lib.mjs';
import { second } from './e-rig2.mjs';
const WS = 'W4QEF1XTURESO01', ALICE = 'U4QEALICE000001';
const SOCKET_HOOK = `(()=>{ if(window.__socks) return; window.__socks=[];
  const W=window.WebSocket; const P=function(...a){ const s=new W(...a); window.__socks.push(s); return s; };
  P.prototype=W.prototype; Object.assign(P,W); window.WebSocket=P; })()`;

export default async ({ page, ctx, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  let block = false;

  await ctx.addInitScript(SOCKET_HOOK);
  // routeWebSocket only hooks sockets opened after a navigation, so this is installed before goto
  await page.routeWebSocket(/\/ws\/chat/, (ws) => { if (block) ws.close(); else ws.connectToServer(); });

  // step 1 — Calendar open, connection healthy
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  await page.evaluate(DOM);
  const healthy = await page.evaluate(() => ({
    sockets: (window.__socks || []).map((s) => s.readyState).join(','),
    banner: /Reconnect|Connecting/i.test(document.body.innerText),
    view: (document.querySelector('main').innerText.split('\n')[1] || '').slice(0, 40),
  }));
  if (healthy.sockets !== '1' || healthy.banner) {
    out.asserted = { healthy };
    out.leftToDo = 'Calendar did not start from a healthy realtime connection — do not judge this '
                 + 'screen. Re-run.';
    return out;
  }
  progress(1);

  // step 2 — break it: kill the socket and refuse every reconnect, HTTP untouched
  block = true;
  await page.evaluate(() => { (window.__socks || []).forEach((s) => { try { s.close(); } catch { /* already gone */ } }); });
  await page.waitForTimeout(5000);
  const down = await page.evaluate(async () => ({
    sockets: (window.__socks || []).map((s) => s.readyState).join(','),
    banner: (document.body.innerText.match(/Reconnecting[^\n]{0,20}|Connecting[^\n]{0,20}/i) || [''])[0],
    httpStillWorks: (await fetch('/api/v1/auth/me', { credentials: 'include' })).status,
  }));
  if (!down.banner || down.httpStillWorks !== 200) {
    out.asserted = { healthy, down };
    out.leftToDo = 'Could not get the page into "connection down, HTTP fine" — do not judge this screen.';
    return out;
  }
  progress(2);

  // step 3 — the other account schedules a meeting and invites this one
  const title = 'E catchup ' + Date.now().toString(36).slice(-4);
  let made = null;
  const rig = await second('E', 'bob');
  try {
    made = await rig.page.evaluate(async ({ ws, title, alice }) => {
      const s = new Date(Date.now() + 7 * 3600e3); s.setMinutes(0, 0, 0);
      const e = new Date(s.getTime() + 30 * 60e3);
      const r = await fetch('/api/v1/calendar/meetings', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace_id: ws, title, starts_at: s.toISOString(), ends_at: e.toISOString(),
          timezone: 'Asia/Tashkent', attendee_user_ids: [alice] }),
      });
      const j = await r.json().catch(() => ({}));
      return { status: r.status, id: j.meeting && j.meeting.id, starts_at: j.meeting && j.meeting.starts_at };
    }, { ws: WS, title, alice: ALICE });
  } finally {
    await rig.browser.close().catch(() => {});
  }
  if (!made || !made.id) {
    out.asserted = { healthy, down, made };
    out.leftToDo = 'The second account could not schedule the meeting — do not judge this screen.';
    return out;
  }
  await page.waitForTimeout(4000);
  const whileDown = await page.evaluate((t) => document.querySelector('main').innerText.includes(t), title);
  progress(3);

  // step 4 — restore, and wait for the banner to clear
  block = false;
  let cleared = false;
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(1500);
    cleared = !(await page.evaluate(() => /Reconnect|Connecting/i.test(document.body.innerText)));
    if (cleared) break;
  }
  const watched = [];
  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(4000);
    watched.push(await page.evaluate((t) => document.querySelector('main').innerText.includes(t), title));
  }
  const serverHasItNow = await page.evaluate(async ({ ws, t }) => {
    const from = new Date(Date.now() - 864e5).toISOString(), to = new Date(Date.now() + 5 * 864e5).toISOString();
    const j = await (await fetch(`/api/v1/calendar/meetings?workspace_id=${ws}&from=${from}&to=${to}`,
      { credentials: 'include' })).json();
    const m = (j.meetings || j.data || []).find((x) => x.title === t);
    return m ? { found: true, my_status: m.my_status, starts_at: m.starts_at } : { found: false };
  }, { ws: WS, t: title });

  out.asserted = {
    url: page.url(),
    connectionWasHealthy: healthy,
    connectionDown: down,
    meetingCreatedByOtherAccount: { title, ...made },
    onScreenWhileDown: whileDown,
    bannerCleared: cleared,
    onScreenAfterRestore: watched,          // one sample every 4 s for 24 s
    serverHasItNow,
    viewNotTouched: true,
  };
  if (!cleared || !serverHasItNow.found) {
    out.leftToDo = 'The connection did not come back, or the server does not have the meeting for '
                 + 'this account — do not judge this screen.';
    return out;
  }
  progress(4);

  out.ready = true;
  out.stepsDone = 4;   // all four steps done — the judging is yours
  out.leftToDo = `While this tab's realtime connection was down (the banner read `
               + `"${down.banner.trim()}" and HTTP kept answering 200), the other account scheduled `
               + `"${title}" for ${made.starts_at} and invited this one. The connection is back and the `
               + `banner has cleared. The server returns that meeting for this account right now `
               + `(my_status "${serverHasItNow.my_status}"). The calendar view has not been touched since. `
               + `Look for the meeting in the grid — then press Day or Week and watch what happens. `
               + `The Files half of the finding is the same shape: Files -> Shared with me, and a file `
               + `shared into a common channel while the connection is down.`;
  return out;
};
