/* Repro — [FE-WEB][CHAT] Переименование канала не проверяет имя,
 * хотя форма создания приводит его к слагу.
 *
 *   ./d c:alice snip/c-rename-no-slug.mjs
 *
 * Puts a channel of the signed-in user back to its slug name, opens Channel
 * details → About and types "Project Alpha Two" into the name field.
 * Pressing Save is the human's step.
 */
export default async ({ page, progress }) => {
  const ws = 'W4QCF1XTURESO01';
  const SLUG = 'qa-c-rename-probe', TYPED = 'Project Alpha Two';
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  // ── 1. GET THERE — a channel of mine, named as the create form would name it ──
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  const probe = await page.evaluate(async ({ ws, SLUG, TYPED }) => {
    const j = await (await fetch(`/api/v1/workspaces/${ws}/channels`, { credentials: 'include' })).json();
    const list = j.channels || j.data || j || [];
    let c = (Array.isArray(list) ? list : []).find(x => x.name === SLUG || x.name === TYPED);
    if (!c) {
      const r = await fetch('/api/v1/channels', { method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: SLUG, type: 'private', workspace_id: ws }) });
      c = await r.json();
      return { id: c.id, nameNow: c.name, note: 'created' };
    }
    if (c.name !== SLUG) {
      await fetch(`/api/v1/channels/${c.id}`, { method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: SLUG }) });
      return { id: c.id, nameNow: SLUG, note: 'reset from "' + c.name + '"' };
    }
    return { id: c.id, nameNow: c.name, note: 'already clean' };
  }, { ws, SLUG, TYPED });
  if (!probe.id) {
    out.leftToDo = 'Setup did not reach the state this finding needs — no probe channel. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }
  progress(1);                                     // step 1: a channel whose name is a slug

  // ── 2. Channel details → About → type the un-slugged name ─────────────
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${probe.id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  await page.locator('button[aria-label="Channel details"]').first().click({ timeout: 10000 });
  await page.waitForTimeout(3000);
  const idx = await page.evaluate((SLUG) => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4; };
    const inputs = [...document.querySelectorAll('input')].filter(vis);
    return inputs.findIndex(i => i.value === SLUG);
  }, SLUG);
  if (idx < 0) {
    out.asserted = { probe, url: page.url() };
    out.leftToDo = 'Setup did not reach the state this finding needs — the name field is not on the '
                 + 'About tab. Re-run, or follow the written steps by hand.';
    return out;
  }
  const field = page.locator('input:visible').nth(idx);
  await field.click();
  await page.keyboard.press('Meta+A');
  await field.type(TYPED, { delay: 40 });
  await page.waitForTimeout(900);

  // ── 3. PROVE IT ────────────────────────────────────────────────────────
  const state = await page.evaluate((TYPED) => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4; };
    const f = [...document.querySelectorAll('input')].filter(vis).find(i => i.value === TYPED);
    const save = [...document.querySelectorAll('button')].filter(vis)
      .find(b => (b.innerText || '').trim() === 'Save');
    const counter = f ? (f.closest('div')?.parentElement?.innerText || '').replace(/\s+/g, ' ').slice(0, 60) : null;
    return {
      fieldValue: f ? f.value : null,
      fieldKeptSpacesAndCaps: !!f && f.value === TYPED,
      saveButton: save ? { disabled: save.disabled } : null,
      nearField: counter,
    };
  }, TYPED);

  out.asserted = { url: page.url(), probeChannel: probe, ...state };
  if (!state.fieldKeptSpacesAndCaps || !state.saveButton || state.saveButton.disabled) {
    out.leftToDo = 'Setup did not reach the state this finding needs — the name field does not hold '
                 + `"${TYPED}" with Save enabled. Re-run, or follow the written steps by hand.`;
    return out;
  }

  // ── 4. HAND OVER ───────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 1;
  out.leftToDo =
    `Step 2 of the finding: the name field on Channel details → About holds "${TYPED}" — spaces and `
    + 'capitals untouched, no counter and no hint that anything is wrong. Click Save. The channel is '
    + `renamed to exactly "${TYPED}" in the header and the sidebar. Control: open Add channel in the `
    + `sidebar and type the same text — creating it gives "project-alpha-two" instead.`;
  return out;
};
