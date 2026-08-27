/* Repro — [FE-WEB][CHAT] Список ролей канала печатает внутренний id роли
 * отдельной строкой.
 *
 *   ./d c:alice snip/c-role-id-visible.mjs
 *
 * Opens Channel details → Roles on a channel the signed-in user owns and
 * scrolls the roles list into view. Reading it is the human's step.
 */
export default async ({ page, progress }) => {
  const ws = 'W4QCF1XTURESO01', ch = 'C4QCPRIVATE0001';   // alice owns this one
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  // ── 1. GET THERE ──────────────────────────────────────────────────────
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  const me = await page.evaluate(async () =>
    (await (await fetch('/api/v1/auth/me', { credentials: 'include' })).json()).id);
  const owner = await page.evaluate(async (ch) => {
    const j = await (await fetch(`/api/v1/channels/${ch}`, { credentials: 'include' })).json();
    return j.owner_id ?? j.created_by ?? null;
  }, ch);
  progress(1);                                     // step 1: a channel the user owns is open

  await page.locator('button[aria-label="Channel details"]').first().click({ timeout: 10000 });
  await page.waitForTimeout(3000);
  const tab = page.locator('[role="tab"]').filter({ hasText: /^Roles/ }).first();
  if (!(await tab.count())) {
    out.asserted = { url: page.url() };
    out.leftToDo = 'Setup did not reach the state this finding needs — no Roles tab on Channel details. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }
  await tab.click();
  await page.waitForTimeout(3000);
  progress(2);                                     // step 2: Roles tab open

  // ── 2. PROVE IT ────────────────────────────────────────────────────────
  const found = await page.evaluate(() => {
    const vis = e => {
      const r = e.getBoundingClientRect();
      let op = 1; for (let n = e; n; n = n.parentElement) op *= Number(getComputedStyle(n).opacity);
      return r.width > 4 && r.height > 4 && op === 1;
    };
    // leaf nodes whose whole text is a 15-character internal id starting with R
    const hits = [...document.querySelectorAll('span,div,p')]
      .filter(e => e.children.length === 0 && /^R[0-9A-Z]{14}$/.test((e.textContent || '').trim()))
      .filter(vis);
    if (hits.length) hits[0].scrollIntoView({ block: 'center' });
    return hits.map(e => {
      const r = e.getBoundingClientRect();
      const row = e.parentElement?.parentElement;
      return { id: (e.textContent || '').trim(),
               size: Math.round(r.width) + '×' + Math.round(r.height),
               y: Math.round(r.top),
               rowText: (row?.innerText || '').replace(/\s+/g, ' ').slice(0, 60) };
    });
  });
  const tabActive = await page.evaluate(() => {
    const t = [...document.querySelectorAll('[role="tab"]')].find(x => /^Roles/.test((x.innerText || '').trim()));
    return t ? t.getAttribute('aria-selected') : null;
  });

  out.asserted = { url: page.url(), signedInUser: me, channelOwner: owner, iAmChannelOwner: owner === me,
                   rolesTabSelected: tabActive, visibleRoleIdNodes: found,
                   viewportHeight: await page.evaluate(() => innerHeight) };
  if (tabActive !== 'true' || !found.length) {
    out.leftToDo = 'Setup did not reach the state this finding needs — the Roles tab is not showing a '
                 + 'role id line. Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 3. HAND OVER ───────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 2;
  out.leftToDo =
    'The Roles tab of Channel details is open and scrolled to the roles list. Read the line under '
    + `each role name: it is the role's internal database id — "${found[0].id}" under `
    + `"${found[0].rowText}". It is a database key, it means nothing to a channel owner, and it takes `
    + 'the line where an explanation of the role belongs.';
  return out;
};
