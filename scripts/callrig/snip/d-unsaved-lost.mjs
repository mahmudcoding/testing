/* Repro: an unsaved settings edit is thrown away without warning when you move to
 * another settings section.
 * Report: lane D, "[FE-WEB][SETTINGS] Несохранённые изменения пропадают при переходе
 * между разделами настроек, без предупреждения" */
const WS = 'W4QDF1XTURESO01';

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  await page.goto(`https://airion-cargo.store/w/${WS}/settings/profile`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3200);

  // step 1 — change Display name without saving
  const field = page.locator('main input').first();
  const original = await page.evaluate(() => {
    const main = document.querySelector('main');
    for (const e of main.querySelectorAll('input')) {
      const lbl = e.getAttribute('aria-label')
                || (e.id && document.querySelector(`label[for="${CSS.escape(e.id)}"]`)?.innerText?.trim()) || '';
      if (/^Display name$/i.test(lbl)) { e.setAttribute('data-qa', 'displayName'); return e.value; }
    }
    return null;
  });
  if (original === null) {
    out.leftToDo = 'Setup did not reach the state this finding needs — no Display name field on '
                 + 'Settings → Profile. Do not judge this screen; re-run.';
    return out;
  }
  const typed = original + ' EDITED';
  await page.locator('main [data-qa="displayName"]').fill(typed);
  await page.waitForTimeout(1500);
  progress(1);

  // step 2 — the unsaved indicator and the Discard / Save panel are on screen
  out.asserted = await page.evaluate(async (orig) => {
    const main = document.querySelector('main');
    const txt = main.innerText;
    const btns = [...main.querySelectorAll('button')].map(b => b.innerText.trim());
    const me = await (await fetch('/api/v1/auth/me', { credentials: 'include' })).json();
    return {
      url: location.href,
      onProfile: /\/settings\/profile$/.test(location.pathname),
      fieldValue: document.querySelector('main [data-qa="displayName"]')?.value ?? null,
      originalValue: orig,
      unsavedNotice: (txt.match(/\d+ unsaved change[s]?/) || [null])[0],
      hasDiscard: btns.includes('Discard'),
      hasSave: btns.some(b => /^Save/.test(b)),
      serverNameStillOriginal: ((me.data || me).name === orig),
      beforeunloadRegistered: await (async () => {
        // a cancelable beforeunload nobody cancels means no browser confirmation either
        const ev = new Event('beforeunload', { cancelable: true });
        return !window.dispatchEvent(ev);   // false === nobody called preventDefault
      })(),
      openDialogs: document.querySelectorAll('[role="dialog"]').length,
    };
  }, original);

  const a = out.asserted;
  if (!a.onProfile || a.fieldValue !== typed || !a.unsavedNotice || !a.hasDiscard || !a.hasSave) {
    out.leftToDo = 'Setup did not reach the state this finding needs — the edit is not on screen with '
                 + 'the "unsaved change" notice and the Discard / Save panel. Do not judge this screen; '
                 + 're-run, or type into Display name by hand.';
    return out;
  }
  progress(2);

  out.ready = true;
  out.stepsDone = 2;   // step 3 (navigate away) is the human's
  out.leftToDo = 'Display name now reads "' + typed + '" — unsaved, with "' + a.unsavedNotice
               + '" and the Discard / Save profile panel on screen. Now click "Appearance" in the '
               + 'settings navigation on the left, then click "Profile" to come back, and look at the '
               + 'field. Nothing was saved to the server (auth/me still returns "' + original + '"), '
               + 'so the edit should either be kept or its loss confirmed first.';
  return out;
};
