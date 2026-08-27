/* Repro: Day does not open on today when the local date and the UTC date have diverged.
 * Report: lane E, "[FE-WEB][CALENDAR] Day открывается не на сегодняшнем дне…"
 *
 * Driven from alice, but the window you judge is the SECOND one: it is relaunched in a
 * timezone where the local date and the UTC date are genuinely different days, so the
 * divergence is real and survives after this script ends (a DevTools timezone override
 * does not — Chrome drops it the moment the debugger detaches).
 */
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { DOM } from './lib.mjs';
import { rigPort } from '../rigmap.mjs';
import { tile } from './e-rig2.mjs';

const RIG = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const WS = 'W4QEF1XTURESO01';
const sh = (cmd, args, env) => {
  try { return { ok: true, out: String(execFileSync(path.join(RIG, cmd), args,
    { cwd: RIG, stdio: 'pipe', timeout: 180000, env: { ...process.env, ...(env || {}) } })) }; }
  catch (e) { return { ok: false, out: String(e.stdout || '') + String(e.stderr || e.message) }; }
};

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const port = rigPort('E', 'bob');

  // A zone whose local date differs from the UTC date right now, whatever the hour.
  // +14 puts local a day AHEAD of UTC once UTC passes 10:00; -10 puts it a day BEHIND
  // before that. Either way the two calendars disagree, which is the finding's condition.
  const utcHour = new Date().getUTCHours();
  const ZONE = utcHour >= 10 ? 'Pacific/Kiritimati' : 'Pacific/Honolulu';

  const clockOf = async () => {
    try {
      const b = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
      const c = b.contexts()[0];
      const p = c.pages().find((x) => x.url().includes('airion-cargo.store')) || c.pages()[0];
      const r = p ? await p.evaluate(() => ({
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        localDate: new Date().toLocaleDateString('en-CA'),
        utcDate: new Date().toISOString().slice(0, 10),
      })) : null;
      await b.close();
      return r;
    } catch { return null; }
  };

  // step 1 — put the browser in a timezone where local and UTC are different days
  let clock = await clockOf();
  if (!clock || clock.localDate === clock.utcDate) {
    sh('stop.sh', ['E', 'bob']);
    await page.waitForTimeout(2500);
    const l = sh('launch.sh', ['E', 'bob'], { TZ: ZONE });   // `open` does pass TZ through
    if (!l.ok) {
      out.asserted = { launch: l.out.slice(0, 300) };
      out.leftToDo = 'Could not relaunch the second browser in a diverging timezone — do not judge '
                   + 'this. Start a browser with TZ set to a zone whose local date differs from UTC '
                   + 'and follow the steps by hand.';
      return out;
    }
    sh('ensure.sh', ['E', 'bob']);
    clock = await clockOf();
  }
  if (!clock || clock.localDate === clock.utcDate) {
    out.asserted = { clock };
    out.leftToDo = 'The second browser is not in a timezone where the local and UTC dates differ — '
                 + 'do not judge this screen, the finding\'s precondition is not met.';
    return out;
  }
  progress(1);

  // step 2 — open Calendar from a clean load, in that browser
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
  const ctx = browser.contexts()[0];
  const p2 = ctx.pages().find((x) => x.url().includes('airion-cargo.store')) || ctx.pages()[0] || await ctx.newPage();
  try {
    await p2.goto(`https://airion-cargo.store/w/${WS}/calendar`, { waitUntil: 'domcontentloaded' });
    await p2.waitForTimeout(5000);
    await p2.evaluate(DOM);

    out.asserted = await p2.evaluate(async () => {
      const m = document.querySelector('main') || document.body;
      const me = await (await fetch('/api/v1/auth/me', { credentials: 'include' })).json().catch(() => ({}));
      return {
        url: location.href,
        signedIn: !!me.email,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        localDate: new Date().toLocaleDateString('en-CA'),
        utcDate: new Date().toISOString().slice(0, 10),
        calendarHeaderNow: m.innerText.replace(/\n+/g, ' | ').slice(0, 90),
        hasDayButton: [...m.querySelectorAll('button')].some((b) => /^Day$/.test(window.__qa.nameOf(b))),
        hasTodayButton: [...m.querySelectorAll('button')].some((b) => /^Today$/.test(window.__qa.nameOf(b))),
      };
    });
    if (!out.asserted.signedIn || !out.asserted.hasDayButton
        || out.asserted.localDate === out.asserted.utcDate) {
      out.leftToDo = 'The second browser did not reach a signed-in Calendar with a diverging clock — '
                   + 'do not judge this screen.';
      return out;
    }
    progress(2);
    await tile({ browser, ctx, page: p2 });      // the window to watch goes in front
  } finally {
    await browser.close().catch(() => {});
  }

  out.ready = true;
  out.stepsDone = 2;   // steps 1-2 done; pressing Day is step 3
  out.leftToDo = `The window in front is running in ${out.asserted.timezone}: its local date is `
               + `${out.asserted.localDate} while the UTC date is ${out.asserted.utcDate} — two `
               + `different days, which is the condition this finding needs. Calendar is freshly `
               + `loaded. Press Day and read the date in the header, the day summary and the `
               + `meetings request; then press Today. `
               + `When you are done, ./scripts/callrig/stop.sh e bob and ./scripts/callrig/ensure.sh e bob `
               + `puts that browser back on the machine's own timezone.`;
  return out;
};
