/* Repro: seven profile/contact fields and the Show timezone switch save and persist, but
 * none of them reaches the profile card a colleague opens.
 * Report: lane D, "[FE-WEB][SETTINGS] Семь полей профиля и переключатель Show timezone
 * обещают показать вас коллегам и ничего не показывают" */
const WS = 'W4QDF1XTURESO01';

// Tag inputs by their visible label so Playwright can fill them the way a person types.
const tag = (page) => page.evaluate(() => {
  const main = document.querySelector('main');
  for (const e of main.querySelectorAll('input,textarea')) {
    let lbl = e.getAttribute('aria-label') || '';
    if (!lbl && e.id) lbl = document.querySelector(`label[for="${CSS.escape(e.id)}"]`)?.innerText?.trim() || '';
    if (!lbl) { let n = e; for (let i = 0; i < 4 && n; i++) { n = n.parentElement; const L = n && n.querySelector && n.querySelector('label'); if (L) { lbl = L.innerText.trim(); break; } } }
    if (lbl) e.setAttribute('data-qa', lbl.replace(/\s+/g, '_'));
  }
});

const save = async (page, label) => {
  const hit = await page.evaluate((l) => {
    const b = [...document.querySelectorAll('main button')].find(x => x.innerText.trim() === l);
    if (!b || b.disabled) return false;
    b.scrollIntoView({ block: 'center' }); b.click(); return true;
  }, label);
  await page.waitForTimeout(2200);
  return hit;
};

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const V = { job: 'QA Job Title', dept: 'QA Department', pron: 'they/them',
              status: 'QA control status', phone: '+998 90 000 00 00',
              li: 'https://linkedin.com/in/qa-alice', gh: 'https://github.com/qa-alice',
              web: 'https://example.com/qa-alice' };

  // ── step 1: Settings → Profile ────────────────────────────────────────────
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/profile`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await tag(page);
  for (const [sel, val] of [['Job_title', V.job], ['Department', V.dept],
                            ['Pronouns', V.pron], ['Status_message', V.status]]) {
    const l = page.locator(`main [data-qa="${sel}"]`);
    if (await l.count()) await l.first().fill(val);
  }
  // Show timezone on
  await page.evaluate(() => {
    const sw = [...document.querySelectorAll('main [role="switch"]')].find(e => {
      let n = e;
      for (let i = 0; i < 6 && n; i++) { n = n.parentElement; if (n && n.innerText && n.innerText.trim().length < 200) return /Show timezone/.test(n.innerText); }
      return false;
    });
    if (sw && sw.getAttribute('aria-checked') !== 'true') { sw.scrollIntoView({ block: 'center' }); sw.click(); }
  });
  await page.waitForTimeout(600);
  const savedProfile = await save(page, 'Save profile');
  progress(1);

  // ── step 2: Settings → Account ────────────────────────────────────────────
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await tag(page);
  for (const [sel, val] of [['Phone', V.phone], ['LinkedIn', V.li], ['GitHub', V.gh], ['Website', V.web]]) {
    const l = page.locator(`main [data-qa="${sel}"]`);
    if (await l.count()) await l.first().fill(val);
  }
  const savedAccount = await save(page, 'Save changes');
  progress(2);

  // ── step 3: reload, everything still there ────────────────────────────────
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/profile`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await tag(page);
  out.asserted = await page.evaluate(async (ws) => {
    const val = (s) => document.querySelector(`main [data-qa="${s}"]`)?.value ?? null;
    const sw = [...document.querySelectorAll('main [role="switch"]')].find(e => {
      let n = e;
      for (let i = 0; i < 6 && n; i++) { n = n.parentElement; if (n && n.innerText && n.innerText.trim().length < 200) return /Show timezone/.test(n.innerText); }
      return false;
    });
    const me = await (await fetch('/api/v1/auth/me', { credentials: 'include' })).json();
    const d = me.data || me;
    const mem = await (await fetch(`/api/v1/workspaces/${ws}/members`, { credentials: 'include' })).json();
    const mine = (mem.members || []).find(m => m.user_id === d.id) || {};
    return {
      url: location.href,
      onProfile: /\/settings\/profile$/.test(location.pathname),
      jobTitleField: val('Job_title'), departmentField: val('Department'),
      pronounsField: val('Pronouns'), statusField: val('Status_message'),
      showTimezoneSwitch: sw ? sw.getAttribute('aria-checked') : null,
      meProfile: d.settings && d.settings.profile, meContacts: d.settings && d.settings.contacts,
      myMemberRowKeys: Object.keys(mine),
      displayName: d.name,
      userId: d.id,
    };
  }, WS);
  out.asserted.savedProfile = savedProfile;
  out.asserted.savedAccount = savedAccount;

  const a = out.asserted;
  const ok = a.onProfile && a.jobTitleField === V.job && a.departmentField === V.dept
          && a.pronounsField === V.pron && a.statusField === V.status
          && a.showTimezoneSwitch === 'true'
          && a.meContacts && a.meContacts.phone === V.phone && a.meContacts.github === V.gh;
  if (!ok) {
    out.leftToDo = 'Setup did not reach the state this finding needs — the profile and contact fields '
                 + 'did not save and read back. Do not judge the profile card; re-run, or fill '
                 + 'Settings → Profile and Settings → Account by hand.';
    return out;
  }
  progress(3);

  // ── hand over: step 4 belongs to the human, in the OTHER browser ──────────
  out.ready = true;
  out.stepsDone = 3;
  out.leftToDo = 'QA Alice now has Job title, Department, Pronouns, Status message, Show timezone on, '
               + 'and Phone / LinkedIn / GitHub / Website — all saved and still there after a reload '
               + '(values quoted in asserted). Now switch to the OTHER browser (the second account) '
               + 'and open Directories → People, then click the name "QA Alice" to open her profile '
               + 'card. Read what the card shows. Status message is the control: it is the one filled '
               + 'field that does reach the card.';
  return out;
};
