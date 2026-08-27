/* Repro: Settings → Appearance → Sidebar position = Right is checked and persisted,
 * but the channel panel stays on the left.
 * Report: lane D, "[FE-WEB][SETTINGS] Sidebar position → Right отмечается и сохраняется,
 * но панель остаётся слева" */
const WS = 'W4QDF1XTURESO01';
const pick = (page, label) => page.evaluate((l) => {
  const b = [...document.querySelectorAll('main button[role="radio"]')]
    .find(e => e.innerText.trim() === l);
  if (!b) return false;
  b.scrollIntoView({ block: 'center' }); b.click(); return true;
}, label);

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  await page.goto(`https://airion-cargo.store/w/${WS}/settings/appearance`,
                  { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // Baseline: put it on Left first, so the Right we set below is a real change.
  await pick(page, 'Left');
  await page.waitForTimeout(600);
  const setRight = await pick(page, 'Right');
  await page.waitForTimeout(1200);

  out.asserted = await page.evaluate((ws) => {
    const rad = (l) => {
      const b = [...document.querySelectorAll('main button[role="radio"]')]
        .find(e => e.innerText.trim() === l);
      return b ? b.getAttribute('aria-checked') : null;
    };
    const h2 = [...document.querySelectorAll('main h2')].map(e => e.innerText.trim());
    let stored = null;
    try { stored = JSON.parse(localStorage.getItem('aloqa.appearance') || 'null'); } catch {}
    return {
      url: location.href,
      onAppearance: /\/settings\/appearance$/.test(location.pathname),
      workspace: location.pathname.includes(ws),
      sectionPresent: h2.includes('Sidebar position'),
      radioLeft: rad('Left'),
      radioRight: rad('Right'),
      storedSidebarSide: stored ? stored.sidebarSide : null,
      cookieSidebar: (document.cookie.split('; ').find(c => c.startsWith('aloqa.sidebar=')) || null),
    };
  }, WS);

  if (!setRight || !out.asserted.onAppearance || out.asserted.radioRight !== 'true') {
    out.leftToDo = 'Setup did not reach the state this finding needs — Sidebar position is not set to '
                 + 'Right on Settings → Appearance. Do not judge this screen; re-run, or set it by hand.';
    return out;
  }
  progress(1);   // step 1: Settings → Appearance, Sidebar position = Right

  out.ready = true;
  out.stepsDone = 1;   // step 2 (open a channel and look at the panel) is the human's
  out.leftToDo = 'Sidebar position is now Right (radio checked, aloqa.sidebar=right). '
               + 'Click any channel in the left panel — e.g. #qa-general — and look at which side '
               + 'the channel panel is on. Expected at Right: panel hard against the right edge. '
               + 'Reloading the page afterwards shows the radio still on Right.';
  return out;
};
