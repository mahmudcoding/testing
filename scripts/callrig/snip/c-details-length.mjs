/* Repro — [FE-WEB][CHAT] В Channel details не видно предела длины Name и Topic,
 * а ошибка не говорит, что не так.
 *
 *   ./d c:alice snip/c-details-length.mjs
 *
 * Opens Channel details → About on a channel of the signed-in user and fills
 * Topic past the server's limit, with the field accepting every character and
 * showing no counter. Pressing Save is the human's step.
 */
export default async ({ page, progress }) => {
  const ws = 'W4QCF1XTURESO01';
  const SLUG = 'qa-c-rename-probe';
  const LONG = 'x'.repeat(300);
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  // ── 1. GET THERE — a channel of mine ──────────────────────────────────
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  const probe = await page.evaluate(async ({ ws, SLUG }) => {
    const j = await (await fetch(`/api/v1/workspaces/${ws}/channels`, { credentials: 'include' })).json();
    const list = j.channels || j.data || j || [];
    let c = (Array.isArray(list) ? list : []).find(x => x.name === SLUG);
    if (!c) {
      const r = await fetch('/api/v1/channels', { method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: SLUG, type: 'private', workspace_id: ws }) });
      c = await r.json();
    }
    return { id: c.id, name: c.name };
  }, { ws, SLUG });
  if (!probe.id) {
    out.leftToDo = 'Setup did not reach the state this finding needs — no channel to edit. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${probe.id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  await page.locator('button[aria-label="Channel details"]').first().click({ timeout: 10000 });
  await page.waitForTimeout(3000);
  progress(1);                                     // step 1: Channel details → About open

  // ── 2. paste a Topic past the limit ───────────────────────────────────
  const ta = page.locator('textarea:visible').first();
  if (!(await ta.count())) {
    out.asserted = { probe, url: page.url() };
    out.leftToDo = 'Setup did not reach the state this finding needs — no Topic field on About. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }
  await ta.click();
  await page.keyboard.press('Meta+A');
  await page.keyboard.press('Delete');
  await ta.fill(LONG);
  await page.waitForTimeout(1000);

  // ── 3. PROVE IT ────────────────────────────────────────────────────────
  const state = await page.evaluate(() => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4; };
    const t = [...document.querySelectorAll('textarea')].filter(vis)[0];
    const name = [...document.querySelectorAll('input')].filter(vis)[0];
    const save = [...document.querySelectorAll('button')].filter(vis)
      .find(b => (b.innerText || '').trim() === 'Save');
    const panelText = (t?.closest('form,div[class]')?.parentElement?.innerText || '')
      .replace(/\s+/g, ' ').slice(0, 120);
    return {
      topicLengthAccepted: t ? t.value.length : null,
      topicMaxLengthAttr: t ? (t.getAttribute('maxlength') ?? null) : null,
      nameMaxLengthAttr: name ? (name.getAttribute('maxlength') ?? null) : null,
      anyDigitsNearTheFields: /\d+\s*\/\s*\d+/.test(panelText),
      panelTextAroundFields: panelText,
      saveButton: save ? { disabled: save.disabled } : null,
    };
  });

  out.asserted = { url: page.url(), channel: probe.name, typedCharacters: LONG.length, ...state };
  if (state.topicLengthAccepted !== LONG.length || state.topicMaxLengthAttr !== null
      || !state.saveButton || state.saveButton.disabled) {
    out.leftToDo = 'Setup did not reach the state this finding needs — the Topic field did not accept '
                 + 'all 300 characters with Save enabled and no maxlength. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 4. HAND OVER ───────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 1;
  out.leftToDo =
    `Step 2 of the finding: the Topic field has taken all ${LONG.length} characters — no maxlength, no `
    + 'counter, no hint of a limit anywhere on the About tab. Click Save and read what comes back: it '
    + 'does not name the field, the limit, or by how much you are over, although the server does '
    + '(description too long (max 256)). Control (step 3): open Add channel in the sidebar and paste '
    + 'the same text into the name field — there the input stops at the limit and a counter is shown.';
  return out;
};
