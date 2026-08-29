/* Host invites a workspace member from an active call; the member Accepts.
 * Does the host ever get a way to let them in?
 * Every step asserts, and the Participants panel is proven open before it is read.
 *   ./d a:alice snip/a-inv-full.mjs
 */
import { DOM } from './lib.mjs';
import { attach, ensureCall, inCall, openPeople, panel, tile, install,
         HOST, WS, NAME } from './a-callkit.mjs';

const leaves = (page) => page.evaluate(() =>
  [...document.querySelectorAll('body *')].filter((e) => !e.children.length)
    .filter(window.__qa.vis).map((e) => (e.innerText || '').replace(/\s+/g, ' ').trim())
    .filter((t) => t && t.length < 90));

const closeDialogs = async (page) => {
  for (let i = 0; i < 4; i++) {
    await install(page);
    const open = await page.evaluate(() =>
      [...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis)
        .filter((d) => d.getAttribute('data-testid') !== 'call-overlay-expanded').length);
    if (!open) return true;
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(700);
  }
  await install(page);
  return page.evaluate(() =>
    [...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis)
      .filter((d) => d.getAttribute('data-testid') !== 'call-overlay-expanded').length === 0);
};

export default async ({ page, ctx, browser }) => {
  const out = {};
  const host = { page, ctx, browser };
  const call = await ensureCall(page);
  out.call = call;
  if (!call.id) return out;

  const obs = await attach('bob');
  await tile(host, 0, 2); await tile(obs, 1, 2);
  await obs.page.goto(`${HOST}/w/${WS}/directories`, { waitUntil: 'domcontentloaded' });
  await obs.page.waitForTimeout(3500);
  await obs.page.evaluate(DOM);
  out.inviteeClean = (await leaves(obs.page)).filter((t) => /calling|approval|waiting|missed/i.test(t));
  if (await inCall(obs.page)) { out.err = 'invitee already in the call'; return out; }

  // POSITIVE CONTROL: the Participants panel opens and lists the host.
  await closeDialogs(page);
  await openPeople(page);
  await page.waitForTimeout(1200);
  const control = await panel(page);
  out.controlPanelRows = (control.rows || []).map((r) => r.slice(0, 70));
  if (!out.controlPanelRows.length) { out.err = 'panel probe is not working — aborting'; return out; }

  // --- invite -----------------------------------------------------------
  const reqs = [];
  page.on('response', async (r) => {
    if (!/\/invite$/.test(r.url())) return;
    let b = null; try { b = (await r.text()).slice(0, 240); } catch {}
    reqs.push({ m: r.request().method(), u: r.url().replace(/https:\/\/[^/]+/, ''),
                s: r.status(), post: r.request().postData(), body: b });
  });
  await install(page);
  out.openDlg = await page.evaluate(() => window.__qa.clickDeepest(/^Add to call$/));
  await page.waitForTimeout(2600);
  await install(page);
  out.rowsInDialog = await page.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis)
      .filter((x) => x.getAttribute('data-testid') !== 'call-overlay-expanded').pop();
    if (!d) return null;
    return [...d.querySelectorAll('input[type=checkbox]')].filter(window.__qa.boxVis)
      .map((n) => ({ name: (window.__qa.nameOf(n) || '').replace(/\s+/g, ' ').trim().slice(0, 50),
                     disabled: n.disabled, checked: n.checked }));
  });
  out.tick = await page.evaluate((w) => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis)
      .filter((x) => x.getAttribute('data-testid') !== 'call-overlay-expanded').pop();
    const c = [...d.querySelectorAll('input[type=checkbox]')].filter(window.__qa.boxVis)
      .filter((n) => (window.__qa.nameOf(n) || '').includes(w) && !n.disabled)[0];
    if (!c) return { err: 'no enabled row for ' + w };
    c.click();
    return { ok: true, checkedAfter: c.checked };
  }, NAME.bob);
  await page.waitForTimeout(1400);
  out.inviteBtn = await page.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis)
      .filter((x) => x.getAttribute('data-testid') !== 'call-overlay-expanded').pop();
    const b = [...d.querySelectorAll('button')].filter(window.__qa.vis)
      .find((x) => /^Invite \(/.test((x.innerText || '').trim()));
    return b ? { label: b.innerText.trim(), disabled: b.disabled } : null;
  });
  if (!out.inviteBtn || out.inviteBtn.disabled) { out.err = 'Invite button never enabled'; return out; }
  out.sent = await page.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis)
      .filter((x) => x.getAttribute('data-testid') !== 'call-overlay-expanded').pop();
    return window.__qa.clickDeepest(/^Invite \(/, d);
  });
  await page.waitForTimeout(2500);
  out.inviteReq = reqs;
  out.dialogClosed = await closeDialogs(page);      // get the modal off the host's screen
  await openPeople(page);
  await page.waitForTimeout(1000);

  // --- invitee accepts --------------------------------------------------
  const oReqs = [];
  obs.page.on('response', async (r) => {
    if (!/\/api\/v1\/meeting/.test(r.url())) return;
    let b = null; try { if (r.status() >= 400) b = (await r.text()).slice(0, 240); } catch {}
    oReqs.push({ m: r.request().method(), u: r.url().replace(/https:\/\/[^/]+/, ''), s: r.status(), body: b });
  });
  let bannerAt = null;
  for (let i = 0; i < 40; i++) {
    await obs.page.waitForTimeout(500);
    await obs.page.evaluate(DOM);
    if (await obs.page.evaluate(() =>
      [...document.querySelectorAll('body *')].filter((e) => !e.children.length)
        .filter(window.__qa.vis).some((e) => /is calling/i.test(e.innerText || ''))))
      { bannerAt = (i + 1) * 500; break; }
  }
  out.bannerAtMs = bannerAt;
  if (bannerAt === null) { out.verdict = 'the invitee never saw an incoming banner'; return out; }
  out.accept = await obs.page.evaluate(() => window.__qa.clickDeepest(/^Accept$/));
  await obs.page.waitForTimeout(3000);
  await obs.page.evaluate(DOM);
  out.inviteeAfterAccept = (await leaves(obs.page))
    .filter((t) => /approval|waiting|admit|join|cancel|call/i.test(t)).slice(0, 8);
  out.inviteeReqs = oReqs;

  // --- host: watch the panel for a way to let them in -------------------
  const seen = [];
  let admitAt = null, admitClick = null;
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(750);
    await install(page);
    const st = await page.evaluate(() => ({
      dlgOpen: [...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis)
        .filter((d) => d.getAttribute('data-testid') !== 'call-overlay-expanded').length,
      words: [...document.querySelectorAll('body *')].filter((e) => !e.children.length)
        .filter(window.__qa.vis).map((e) => (e.innerText || '').replace(/\s+/g, ' ').trim())
        .filter((t) => t && t.length < 60 && /waiting|admit|deny|approval|QA Bob/i.test(t)),
      hasAdmit: [...document.querySelectorAll('button')].filter(window.__qa.vis)
        .some((b) => /^Admit/.test((window.__qa.nameOf(b) || '').trim())),
    }));
    const key = JSON.stringify(st);
    if (!seen.length || seen[seen.length - 1].key !== key) seen.push({ ms: (i + 1) * 750, key, ...st });
    if (st.hasAdmit && admitAt === null) {
      admitAt = (i + 1) * 750;
      admitClick = await page.evaluate(() => window.__qa.clickDeepest(/^Admit/));
      await page.waitForTimeout(4000);
    }
  }
  out.hostStates = seen.map((s) => ({ ms: s.ms, dlgOpen: s.dlgOpen, hasAdmit: s.hasAdmit, words: s.words }));
  out.admitOfferedAtMs = admitAt;
  out.admitClick = admitClick;
  await obs.page.waitForTimeout(4000);
  out.inviteeInCallAtEnd = await inCall(obs.page);
  out.inviteeUrlAtEnd = obs.page.url().replace(/https:\/\/[^/]+/, '');
  const p2 = await panel(page);
  out.hostPanelAtEnd = (p2.rows || []).map((r) => r.slice(0, 70));
  return out;
};
