/* Repro: five Settings → Appearance settings snap back to their default on reload
 * while the stored value keeps the user's choice.
 * Report: lane D, "[FE-WEB][SETTINGS] Пять настроек Appearance после перезагрузки
 * возвращаются к значению по умолчанию, сохранив выбор пользователя" */
const WS = 'W4QDF1XTURESO01';

// In-page helpers. `sectionOf` walks up to the nearest <h2>, because Density and
// Message layout both offer a radio labelled "Compact".
const DOM = () => {
  const sectionOf = (el) => {
    let n = el;
    for (let i = 0; i < 8 && n; i++) {
      n = n.parentElement;
      const h = n && n.querySelector && n.querySelector('h2');
      if (h) return h.innerText.trim();
    }
    return '';
  };
  const radio = (section, label) => [...document.querySelectorAll('main button[role="radio"]')]
    .find(r => sectionOf(r) === section && r.innerText.trim() === label);
  const swi = (label) => [...document.querySelectorAll('main button[role="switch"]')].find(e => {
    let n = e;
    for (let i = 0; i < 6 && n; i++) {
      n = n.parentElement;
      if (n && n.innerText && n.innerText.trim().length < 200) return n.innerText.includes(label);
    }
    return false;
  });
  const stored = () => { try { return JSON.parse(localStorage.getItem('aloqa.appearance') || 'null'); } catch { return null; } };
  window.__d = { sectionOf, radio, swi, stored };
};

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  await page.goto(`https://airion-cargo.store/w/${WS}/settings/appearance`,
                  { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  await page.evaluate(DOM);
  progress(1);   // step 1: on Settings → Appearance

  // Converge each control on the target. The screen renders from the store, so a click whose
  // stored value already equals the target re-renders nothing; when store and screen disagree
  // — which is the defect itself, left behind by an earlier run — the other option has to be
  // clicked first to bring the store back before the target click can move the screen.
  const converge = async (read, clickTarget, clickOther, tries = 5) => {
    for (let i = 0; i < tries; i++) {
      await page.evaluate(DOM);
      const st = await page.evaluate(read);
      if (st.screenOk && st.storeOk) return 'ok';
      await page.evaluate(st.storeOk && !st.screenOk && clickOther ? clickOther : clickTarget);
      await page.waitForTimeout(900);
    }
    await page.evaluate(DOM);
    const st = await page.evaluate(read);
    return (st.screenOk && st.storeOk) ? 'ok' : 'no';
  };

  const ml = await converge(
    () => ({ screenOk: window.__d.radio('Message layout', 'Compact')?.getAttribute('aria-checked') === 'true',
             storeOk:  window.__d.stored()?.msgLayout === 'compact' }),
    () => { const b = window.__d.radio('Message layout', 'Compact'); b && (b.scrollIntoView({ block: 'center' }), b.click()); },
    () => { const b = window.__d.radio('Message layout', 'Standard'); b && (b.scrollIntoView({ block: 'center' }), b.click()); });

  const sr = await converge(
    () => ({ screenOk: window.__d.swi('Show member roles')?.getAttribute('aria-checked') === 'false',
             storeOk:  window.__d.stored()?.showRoles === false }),
    () => { const b = window.__d.swi('Show member roles'); b && (b.scrollIntoView({ block: 'center' }), b.click()); },
    null);

  // Control from the group that does survive a reload.
  const de = await converge(
    () => ({ screenOk: window.__d.radio('Density', 'Compact')?.getAttribute('aria-checked') === 'true',
             storeOk:  window.__d.stored()?.density === 'compact' }),
    () => { const b = window.__d.radio('Density', 'Compact'); b && (b.scrollIntoView({ block: 'center' }), b.click()); },
    () => { const b = window.__d.radio('Density', 'Cozy'); b && (b.scrollIntoView({ block: 'center' }), b.click()); });

  await page.evaluate(DOM);
  out.asserted = await page.evaluate(() => {
    const d = window.__d;
    return {
      url: location.href,
      onAppearance: /\/settings\/appearance$/.test(location.pathname),
      msgLayoutOnScreen: ['Standard', 'Compact'].map(l => l + '=' + d.radio('Message layout', l)?.getAttribute('aria-checked')),
      showMemberRolesOnScreen: d.swi('Show member roles')?.getAttribute('aria-checked'),
      densityOnScreen: ['Compact', 'Cozy', 'Comfortable'].map(l => l + '=' + d.radio('Density', l)?.getAttribute('aria-checked')),
      stored: d.stored(),
      noSavePanel: ![...document.querySelectorAll('main button')].some(b => /^Save/i.test(b.innerText.trim())),
    };
  });
  out.asserted.converged = { messageLayout: ml, showMemberRoles: sr, density: de };

  if (!out.asserted.onAppearance || ml !== 'ok' || sr !== 'ok' || de !== 'ok') {
    out.leftToDo = 'Setup did not reach the state this finding needs — the settings are not switched '
                 + 'away from their defaults both on screen and in storage. Do not judge this screen; '
                 + 're-run, or change them by hand.';
    return out;
  }
  progress(2);   // step 2: changed, applied immediately, no save panel, nothing sent to the server

  out.ready = true;
  out.stepsDone = 2;   // step 3 (reload and look at the same controls) is the human's
  out.leftToDo = 'Message layout = Compact and Show member roles = off, both on screen and in storage '
               + '(aloqa.appearance: msgLayout "compact", showRoles false). Density = Compact was set in '
               + 'the same pass as the control — it belongs to the group that survives a reload. '
               + 'Now reload the page (Cmd+R) and look at the same three controls: Message layout and '
               + 'Show member roles go back to Standard / on while aloqa.appearance still holds '
               + '"compact" and false; Density stays on Compact.';
  return out;
};
