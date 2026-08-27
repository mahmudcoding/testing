/* Repro: two controls in one Visibility section govern the same thing and disagree — the
 * Online status list changes nothing, the Show online status switch does, and the section
 * caption says neither works.
 * Report: lane D, "[FE-WEB][SETTINGS] Два элемента видимости присутствия противоречат
 * друг другу, а подпись секции неверна" */
const WS = 'W4QDF1XTURESO01';

// Installed in the page; `combobox` walks up from each combobox until an ancestor whose text
// starts with the row title, because the three lists here are otherwise identical.
const DOM = () => {
  const main = () => document.querySelector('main');
  const combobox = (label) => {
    const cbs = [...main().querySelectorAll('[role="combobox"]')].filter(e => e.tagName === 'BUTTON');
    return cbs.find(e => {
      let n = e;
      for (let i = 0; i < 8 && n; i++) {
        n = n.parentElement;
        const t = (n && typeof n.innerText === 'string') ? n.innerText.trim() : '';
        if (t.startsWith(label)) return true;
      }
      return false;
    });
  };
  const switchByLabel = (label) => [...main().querySelectorAll('[role="switch"]')].find(e => {
    let n = e;
    for (let i = 0; i < 7 && n; i++) {
      n = n.parentElement;
      const t = (n && typeof n.innerText === 'string') ? n.innerText : '';
      if (t.includes(label)) return true;
    }
    return false;
  });
  const visibilitySection = () => {
    const all = [...main().querySelectorAll('*')].filter(e => /Visibility/.test(e.textContent || '')
      && e.querySelectorAll('[role="combobox"],[role="switch"]').length >= 5);
    all.sort((a, b) => a.textContent.length - b.textContent.length);
    return all[0] || null;
  };
  window.__d = { main, combobox, switchByLabel, visibilitySection };
};

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  await page.goto(`https://airion-cargo.store/w/${WS}/settings/privacy`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3200);
  progress(1);   // step 1: on Settings → Privacy & security, Visibility section

  await page.evaluate(DOM);
  await page.evaluate(() => { const el = window.__d.combobox('Online status'); el && el.setAttribute('data-qa', 'onlineStatus'); });
  const found = await page.locator('[data-qa="onlineStatus"]').count();
  if (!found) {
    out.leftToDo = 'Setup did not reach the state this finding needs — no Online status list in the '
                 + 'Visibility section. Do not judge this screen; re-run, or set it by hand.';
    return out;
  }

  // step 2 — Online status = Nobody. The options render as plain spans inside the
  // [role=listbox] portal, so the click goes to the span's nearest clickable ancestor.
  await page.locator('[data-qa="onlineStatus"]').click({ timeout: 6000 });
  await page.waitForTimeout(1300);
  const picked = await page.evaluate(() => {
    const lb = [...document.querySelectorAll('[role="listbox"]')].pop();
    if (!lb) return false;
    const leaf = [...lb.querySelectorAll('*')].find(e => e.children.length === 0
      && typeof e.innerText === 'string' && e.innerText.trim() === 'Nobody');
    if (!leaf) return false;
    let n = leaf;
    for (let i = 0; i < 4 && n; i++) { if (getComputedStyle(n).cursor === 'pointer' || n.getAttribute('role')) break; n = n.parentElement; }
    (n || leaf).click();
    return true;
  });
  await page.waitForTimeout(2600);

  await page.evaluate(DOM);
  out.asserted = await page.evaluate(async () => {
    const main = document.querySelector('main');
    const cb = main.querySelector('[data-qa="onlineStatus"]');
    const sw = window.__d.switchByLabel('Show online status');
    const sec = window.__d.visibilitySection();
    const ps = await (await fetch('/api/v1/users/me/presence-settings', { credentials: 'include' })).json();
    const me = await (await fetch('/api/v1/auth/me', { credentials: 'include' })).json();
    const d = me.data || me;
    return {
      url: location.href,
      onPrivacy: /\/settings\/privacy$/.test(location.pathname),
      sectionCaption: sec ? sec.innerText.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 3) : null,
      sectionControls: sec ? [...sec.querySelectorAll('[role="combobox"],[role="switch"]')]
        .map(e => e.getAttribute('role') + ':' + (e.getAttribute('aria-checked') ?? e.innerText.trim())) : null,
      onlineStatusList: cb ? cb.innerText.trim() : null,
      showOnlineStatusSwitch: sw ? sw.getAttribute('aria-checked') : null,
      presenceSettings: ps,
      account: d.id,
      accountName: d.name,
      privacyOnMe: d.settings && d.settings.privacy,
    };
  });

  const a = out.asserted;
  if (!picked || !a.onPrivacy || a.onlineStatusList !== 'Nobody') {
    out.leftToDo = 'Setup did not reach the state this finding needs — Online status is not set to '
                 + 'Nobody. Do not judge this screen; re-run, or set it by hand.';
    return out;
  }
  progress(2);   // step 2: Online status = Nobody, saved

  out.ready = true;
  out.stepsDone = 2;   // step 3 (look at this account's presence from another account) is the human's
  out.leftToDo = 'Online status now reads "Nobody" on this screen. Two things to look at, in order. '
               + 'First, on this same screen: the "Show online status" switch three rows below is still '
               + 'on (aria-checked=' + a.showOnlineStatusSwitch + '), and the caption above the whole '
               + 'section reads "' + (a.sectionCaption ? a.sectionCaption[2] : '') + '". Second: switch '
               + 'to the OTHER browser (a different member of the same workspace) and look at this '
               + 'account\'s presence — the green online dot beside "' + a.accountName + '" in the '
               + 'members list or Directories → People. Then come back, put Online status back and turn '
               + 'the "Show online status" switch off instead, and look again.';
  return out;
};
