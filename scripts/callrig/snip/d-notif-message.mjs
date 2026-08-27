/* Repro: the Notifications refusal names a condition that does not exist on the page and
 * advises the one action that cannot help.
 * Report: lane D, "[FE-WEB][SETTINGS] Сообщение об ошибке в Notifications называет
 * условие и способ его снять неверно" */
const WS = 'W4QDF1XTURESO01';

const swi = (label) => {
  const all = [...document.querySelectorAll('main [role="switch"]')];
  return all.find(e => {
    let n = e;
    for (let i = 0; i < 6 && n; i++) {
      n = n.parentElement;
      if (n && n.innerText && n.innerText.trim().length < 200) return n.innerText.includes(label);
    }
    return false;
  });
};

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  await page.goto(`https://airion-cargo.store/w/${WS}/settings/notifications`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Precondition: In-app on, Mute channel notifications off — the state the server refuses.
  const pre = await page.evaluate(`(${swi})`).catch(() => null);
  await page.evaluate((src) => {
    const swi = eval('(' + src + ')');
    const a = swi('In-app notifications'), b = swi('Mute channel notifications');
    if (a && a.getAttribute('aria-checked') !== 'true') { a.scrollIntoView({ block: 'center' }); a.click(); }
    if (b && b.getAttribute('aria-checked') === 'true') { b.scrollIntoView({ block: 'center' }); b.click(); }
  }, String(swi));
  await page.waitForTimeout(800);
  const server = await page.evaluate(async () => {
    const r = await fetch('/api/v1/notifications/settings', { credentials: 'include' });
    return r.ok ? await r.json() : { status: r.status };
  });
  if (server.in_app_enabled !== true || server.mute_all_channels !== false) {
    // put the server into the precondition explicitly through the page's own form, then reload
    await page.evaluate(() => {
      const b = [...document.querySelectorAll('main button')].find(x => /^Save preferences$/.test(x.innerText.trim()));
      b && b.click();
    });
    await page.waitForTimeout(2200);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
  }

  // step 1 — turn In-app notifications off and press Save preferences
  await page.evaluate((src) => {
    const swi = eval('(' + src + ')');
    const a = swi('In-app notifications');
    if (a && a.getAttribute('aria-checked') === 'true') { a.scrollIntoView({ block: 'center' }); a.click(); }
  }, String(swi));
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('main button')].find(x => /^Save preferences$/.test(x.innerText.trim()));
    b && b.click();
  });
  await page.waitForTimeout(2500);

  out.asserted = await page.evaluate(async (src) => {
    const swi = eval('(' + src + ')');
    const main = document.querySelector('main');
    const txt = main.innerText;
    const labels = [...main.querySelectorAll('[role="switch"]')].map(e => {
      let n = e;
      for (let i = 0; i < 6 && n; i++) { n = n.parentElement; if (n && n.innerText && n.innerText.trim().length < 200) return n.innerText.trim().split('\n')[0]; }
      return '?';
    });
    const server = await (await fetch('/api/v1/notifications/settings', { credentials: 'include' })).json();
    return {
      url: location.href,
      onNotifications: /\/settings\/notifications$/.test(location.pathname),
      switchesOnPage: labels,
      inAppSwitchNow: swi('In-app notifications')?.getAttribute('aria-checked'),
      refusalOnScreen: (txt.match(/In-app notifications cannot be turned off[^\n]*/) || [null])[0],
      hintOnScreen: (txt.match(/Keep at least one[^\n]*/) || [null])[0],
      serverStillOn: server.in_app_enabled,
      savePanelStillThere: [...main.querySelectorAll('button')].some(b => /^Save preferences$/.test(b.innerText.trim())),
    };
  }, String(swi));

  const a = out.asserted;
  if (!a.onNotifications || !a.refusalOnScreen) {
    out.leftToDo = 'Setup did not reach the state this finding needs — the refusal message is not on '
                 + 'screen. Do not judge this screen; re-run, or turn In-app notifications off and '
                 + 'press Save preferences by hand.';
    return out;
  }
  progress(1);   // step 1: turned off and saved, refusal shown

  out.ready = true;
  out.stepsDone = 1;   // step 2 (read it and hunt for the other delivery method) is the human's
  out.leftToDo = 'The refusal is on screen: "' + a.refusalOnScreen + '" Now read it and look on this '
               + 'page for the "other delivery method" it tells you to enable. There are exactly three '
               + 'switches here: ' + a.switchesOnPage.join(' · ') + '. Then, if you want the third step '
               + 'of the report: turn Mute channel notifications on, turn In-app notifications off '
               + 'again and press Save preferences — that one is accepted. Press Discard to leave the '
               + 'account as it was.';
  return out;
};
