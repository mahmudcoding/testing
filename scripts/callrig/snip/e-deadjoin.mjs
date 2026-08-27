/* Repro: an invalid invite link opens a page with nowhere to go.
 * Report: lane E, "[FE-WEB][CALENDAR] Недействительная ссылка-приглашение открывает страницу…"
 *
 * Lands on /calendar/join/<invalid token> and hands you a live valid link of the same shape
 * to compare against.
 */
import { DOM } from './lib.mjs';
const WS = 'W4QEF1XTURESO01';
const BAD = 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  // A working link of the same shape, so the comparison is available without setup.
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  const goodUrl = await page.evaluate(async (ws) => {
    const s = new Date(Date.now() + 3 * 3600e3); s.setMinutes(0, 0, 0);
    const e = new Date(s.getTime() + 30 * 60e3);
    const r = await fetch('/api/v1/calendar/meetings', {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspace_id: ws, title: 'E deadlink control ' + Date.now().toString(36).slice(-4),
        starts_at: s.toISOString(), ends_at: e.toISOString(), timezone: 'Asia/Tashkent' }),
    });
    const j = await r.json().catch(() => ({}));
    return (j.meeting && j.meeting.guest_join_url) || null;
  }, WS).catch(() => null);

  // step 1 — open the route with a token that is not a live invitation
  await page.goto(`https://airion-cargo.store/calendar/join/${BAD}`, { waitUntil: 'domcontentloaded' });
  // step 2 — let it render
  await page.waitForTimeout(6000);
  await page.evaluate(DOM);

  out.asserted = await page.evaluate(() => {
    const vis = (e) => window.__qa.vis(e);
    return {
      url: location.href,
      pageText: (document.body.innerText || '').replace(/\n+/g, ' | ').slice(0, 200),
      buttons: document.querySelectorAll('button').length,
      links: document.querySelectorAll('a[href]').length,
      visibleControls: [...document.querySelectorAll('button, a[href], [role=button], input')]
        .filter(vis).map((e) => e.tagName + ':' + window.__qa.nameOf(e).slice(0, 30)),
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
    };
  });
  out.asserted.workingLinkOfTheSameShape = goodUrl;

  if (!/\/calendar\/join\//.test(out.asserted.url) || !out.asserted.pageText) {
    out.leftToDo = 'Did not land on a rendered /calendar/join/ page — do not judge this screen. '
                 + 'Open the URL by hand.';
    return out;
  }
  progress(1); progress(2);

  out.ready = true;
  out.stepsDone = 2;   // both of the finding's steps are done — the judging is yours
  out.leftToDo = 'This is /calendar/join/ with a token that is not a live invitation, fully rendered. '
               + 'Look for any way off this page — a button, a link, navigation, a sidebar, anything '
               + 'below the fold — and see whether it tells you why the link did not work. '
               + (goodUrl ? `For comparison, the same route with a working token: ${goodUrl}` : '');
  return out;
};
