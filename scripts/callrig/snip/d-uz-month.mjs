/* Repro: in the Uzbek locale every date renders the month as the code M08.
 * Report: lane D, "[FE-WEB][SETTINGS][I18N] В узбекской локали месяц во всех датах
 * выводится кодом M08" */
const WS = 'W4QDF1XTURESO01';

// The language picker and its option labels are themselves localized, so neither can be
// matched by an English string on a second run. The dialog lists exactly the four languages
// the app has, in a fixed order — English, Russian, Uzbek, Uzbek (Cyrillic) — so the option
// is taken by position after asserting there are four of them, and the result is verified
// against <html lang>.
const setLanguage = async (page, index) => {
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('main button[aria-haspopup="dialog"]')][0];
    b && (b.scrollIntoView({ block: 'center' }), b.click());
  });
  await page.waitForTimeout(1500);
  const picked = await page.evaluate((i) => {
    const dlgs = [...document.querySelectorAll('[role="dialog"]')];
    const el = dlgs[dlgs.length - 1];
    if (!el) return { ok: false, why: 'no dialog' };
    const leaves = [...el.querySelectorAll('*')]
      .filter(e => e.children.length === 0 && e.innerText && e.innerText.trim());
    if (leaves.length !== 4) return { ok: false, why: 'options=' + leaves.length, labels: leaves.map(e => e.innerText.trim()) };
    const t = leaves[i];
    (t.closest('[role="option"],[role="menuitem"],[role="menuitemradio"],button,li') || t).click();
    return { ok: true, clicked: t.innerText.trim(), labels: leaves.map(e => e.innerText.trim()) };
  }, index);
  await page.waitForTimeout(2800);
  return picked;
};

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  const already = await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, { waitUntil: 'domcontentloaded' })
    .then(() => page.waitForTimeout(2500))
    .then(() => page.evaluate(() => document.documentElement.lang));
  const picked = already === 'uz' ? { ok: true, clicked: '(already Uzbek)' } : await setLanguage(page, 2);
  progress(1);   // step 1: interface language is Uzbek

  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/audit-log`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4200);

  out.asserted = await page.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    const rows = [...main.querySelectorAll('tbody tr')];
    const created = rows.map(r => r.querySelectorAll('td')[3]?.innerText.trim()).filter(Boolean);
    return {
      url: location.href,
      onAuditLog: /\/settings\/admin\/audit-log$/.test(location.pathname),
      htmlLang: document.documentElement.lang,
      headers: [...main.querySelectorAll('thead th')].map(t => t.innerText.trim()),
      rowCount: rows.length,
      firstDates: created.slice(0, 3),
      datesWithMonthCode: created.filter(d => /\bM\d{2}\b/.test(d)).length,
      datesTotal: created.length,
      languagePick: null,
      intl: {
        uz: new Intl.DateTimeFormat('uz', { month: 'long' }).format(new Date(2026, 7, 27)),
        uzLatn: new Intl.DateTimeFormat('uz-Latn', { month: 'long' }).format(new Date(2026, 7, 27)),
        uzCyrl: new Intl.DateTimeFormat('uz-Cyrl', { month: 'long' }).format(new Date(2026, 7, 27)),
        ru: new Intl.DateTimeFormat('ru', { month: 'long' }).format(new Date(2026, 7, 27)),
      },
    };
  });

  const a = out.asserted;
  if (!picked.ok || a.htmlLang !== 'uz' || !a.onAuditLog || a.datesTotal === 0) {
    out.leftToDo = 'Setup did not reach the state this finding needs — the language was not switched to '
                 + 'Uzbek, or the audit log rendered no dated rows. Do not judge this screen; re-run, or '
                 + 'switch the language in Settings → Account by hand.';
    return out;
  }
  progress(2);   // step 2: on a screen with dates, in Uzbek

  out.ready = true;
  out.stepsDone = 2;   // step 3 (read the date columns) is the human's
  out.leftToDo = 'The interface is in Uzbek and you are on the audit log. Read the CREATED column: '
               + a.datesWithMonthCode + ' of ' + a.datesTotal + ' dates render the month as a code '
               + '(e.g. "' + (a.firstDates[0] || '') + '"). The same happens on Settings → Admin → Members '
               + 'and Settings → Admin → Invites. Then switch the language to "Uzbek (Cyrillic)" in '
               + 'Settings → Account and open the same screens — the month is a word there. '
               + 'Put the language back to English when you are done.';
  return out;
};
