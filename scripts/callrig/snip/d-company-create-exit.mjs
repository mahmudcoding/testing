/* Repro: /company/create carries no way off it — two interactive elements in the whole
 * document, no heading, no landmark.
 * Report: lane D, "[FE-WEB][ONBOARDING] Страница создания компании не содержит ни одного
 * способа с неё уйти" */
const WS = 'W4QDF1XTURESO01';

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  // Route of the finding's step 4: an account that is already in a company reaches the same
  // page through the company switcher. Step 1-2's route needs a brand-new account; the
  // finding measured both and found the page identical.
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/company`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('main button')]
      .find(x => /Switch company/i.test(x.getAttribute('aria-label') || x.innerText || ''));
    b && b.setAttribute('data-qa', 'switchco');
  });
  if (!(await page.locator('[data-qa="switchco"]').count())) {
    out.leftToDo = 'Setup did not reach the state this finding needs — no company switcher on '
                 + 'Settings → Company. Do not judge this screen; re-run.';
    return out;
  }
  await page.locator('[data-qa="switchco"]').click({ timeout: 6000 });
  await page.waitForTimeout(1600);
  const opened = await page.evaluate(() => {
    const all = [...document.querySelectorAll('[data-radix-popper-content-wrapper] *,[role="dialog"] *,[role="menu"] *')];
    const leaf = all.find(e => e.children.length === 0 && typeof e.innerText === 'string'
                            && /^Create a company$/i.test(e.innerText.trim()));
    if (!leaf) return false;
    let n = leaf;
    for (let i = 0; i < 4 && n; i++) { if (n.getAttribute('role') || getComputedStyle(n).cursor === 'pointer') break; n = n.parentElement; }
    (n || leaf).click();
    return true;
  });
  await page.waitForTimeout(3200);

  out.asserted = await page.evaluate(() => {
    // whole document, not a content area — the page has no landmark to scope to
    const interactive = [...document.querySelectorAll('button,a[href],input,select,textarea,[role="button"],[role="link"],[role="menuitem"],[tabindex]')]
      .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; })
      .map(e => `${e.tagName}[${e.getAttribute('role') || e.type || ''}] "${(e.getAttribute('aria-label') || e.innerText || e.placeholder || '').trim().slice(0, 40)}"${e.disabled ? ' DISABLED' : ''}`);
    return {
      url: location.href,
      onCreateCompany: location.pathname === '/company/create',
      pageText: document.body.innerText.replace(/\n+/g, ' | ').trim().slice(0, 200),
      interactiveWholeDocument: interactive,
      interactiveCount: interactive.length,
      headings: document.querySelectorAll('h1,h2,h3,h4,h5,h6,[role=heading]').length,
      landmarks: ['main', 'nav', 'header', 'footer', '[role=main]']
        .map(s => s + ':' + document.querySelectorAll(s).length),
    };
  });

  const a = out.asserted;
  if (!opened || !a.onCreateCompany) {
    out.leftToDo = 'Setup did not reach the state this finding needs — the browser is not on '
                 + '/company/create. Do not judge this screen; re-run, or open Settings → Company → '
                 + 'the company switcher → Create a company by hand.';
    return out;
  }
  progress(2);   // the page under test is open (reached by the step-4 route)

  out.ready = true;
  // The script took the step-4 route rather than steps 1-2 (which need a brand-new account);
  // the page is the same one, so the human's next action is step 3.
  out.stepsDone = 2;
  out.leftToDo = 'You are on /company/create, reached from an account that already belongs to a '
               + 'company (the route the finding\'s step 4 describes — steps 1-2 reach the same page '
               + 'from a brand-new account\'s welcome screen). Now do step 3: look for any way off '
               + 'this page — Cancel, Back, a link, a logo, anything. For the comparison the finding '
               + 'draws, the Create workspace dialog has Cancel, and /auth/verify-email, '
               + '/magic-link/verify and /reset-password each carry "Back to sign in". '
               + 'Browser Back returns you to the settings screen.';
  return out;
};
