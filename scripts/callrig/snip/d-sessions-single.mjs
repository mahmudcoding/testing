/* Repro: with exactly one active session the Sessions screen offers no control at all,
 * while its own subtitle promises a way to sign a device out.
 * Report: lane D, "[FE-WEB][SECURITY] При единственной сессии экран Sessions не
 * предлагает ни одного действия" */
const WS = 'W4QDF1XTURESO01';

const readScreen = (page) => page.evaluate(() => {
  const main = document.querySelector('main');
  const nav = main.querySelector('nav,[role="navigation"]');
  const inContent = (e) => !nav || !nav.contains(e);
  const controls = [...main.querySelectorAll('button,a[href],input,select,textarea,[role="switch"],[role="button"],[role="link"],[role="checkbox"]')]
    .filter(inContent)
    .map(e => `${e.tagName}[${e.getAttribute('role') || e.type || ''}] "${(e.getAttribute('aria-label') || e.innerText || '').trim().slice(0, 40)}"`);
  const lines = main.innerText.split('\n').map(s => s.trim()).filter(Boolean);
  const h1 = (main.querySelector('h1')?.innerText || '').trim();
  const j = lines.lastIndexOf(h1);
  return { controls, h1, subtitle: j >= 0 ? (lines[j + 1] || null) : null,
           bodyTail: lines.slice(j >= 0 ? j : 0).slice(0, 12) };
});

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  await page.goto(`https://airion-cargo.store/w/${WS}/settings/sessions`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3200);

  const count = () => page.evaluate(async () => {
    const r = await fetch('/api/v1/security/sessions', { credentials: 'include' });
    const j = await r.json();
    return (j.sessions || []).length;
  });

  // Precondition: exactly one session. Earlier testing on this account routinely leaves a
  // second one behind, and with two sessions the screen legitimately shows two buttons —
  // which reads like the finding failing. Reduce first, then measure.
  let n = await count();
  const before = n;
  if (n > 1) {
    await page.evaluate(() => {
      const b = [...document.querySelectorAll('main button')].find(x => /Sign out other sessions/.test(x.innerText));
      b && (b.scrollIntoView({ block: 'center' }), b.click());
    });
    await page.waitForTimeout(2500);
    // a confirmation step may be in the way
    await page.evaluate(() => {
      const d = [...document.querySelectorAll('[role="dialog"]')].pop();
      if (!d) return;
      const b = [...d.querySelectorAll('button')].find(x => /Sign out|Confirm|Yes/i.test(x.innerText));
      b && b.click();
    });
    await page.waitForTimeout(2500);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3200);
    n = await count();
  }
  progress(1);   // step 1: the account is signed in on one device and nowhere else

  const screen = await readScreen(page);
  out.asserted = {
    url: page.url(),
    onSessions: /\/settings\/sessions$/.test(new URL(page.url()).pathname),
    sessionsBefore: before,
    sessionsNow: n,
    screenTitle: screen.h1,
    screenSubtitle: screen.subtitle,
    contentAreaControls: screen.controls,
    contentAreaControlCount: screen.controls.length,
    rowText: screen.bodyTail,
  };

  const a = out.asserted;
  if (!a.onSessions || a.sessionsNow !== 1) {
    out.leftToDo = 'Setup did not reach the state this finding needs — the account still has '
                 + a.sessionsNow + ' active sessions, and with more than one the screen legitimately '
                 + 'offers buttons. Do not judge this screen; re-run, or press "Sign out other '
                 + 'sessions" by hand first.';
    return out;
  }
  progress(2);   // step 2: on Settings → Sessions with exactly one session

  out.ready = true;
  out.stepsDone = 2;   // steps 3-4 (sign in a second browser and look again) are the human's
  out.leftToDo = 'Exactly one session is active. Read this screen: its subtitle is "'
               + (a.screenSubtitle || '') + '", and count the controls in the content area — '
               + 'the settings navigation on the left does not count. Then, for steps 3-4, sign the '
               + 'same account in in a second browser profile and reopen this screen: "Sign out" and '
               + '"Sign out other sessions" appear, with the same subtitle.';
  return out;
};
