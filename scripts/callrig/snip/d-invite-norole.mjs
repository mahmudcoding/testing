/* Repro: a direct invite sent with "Invite without a role" is listed as "Role unavailable".
 * Report: lane D, "[FE-WEB][ADMIN] Приглашение, отправленное без роли, выводится как
 * Role unavailable" */
const WS = 'W4QDF1XTURESO01';

const CB = () => {
  window.__cb = () => [...document.querySelectorAll('main input[type=checkbox]')].map(e => {
    let n = e, lbl = '';
    for (let i = 0; i < 6 && n; i++) {
      n = n.parentElement;
      if (n && n.innerText && n.innerText.trim() && n.innerText.trim().length < 120) { lbl = n.innerText.trim().split('\n')[0]; break; }
    }
    return { lbl, checked: e.checked, e };
  });
};

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/invites`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.evaluate(CB);
  progress(1);   // step 1: on Settings → Admin → Invites, Direct invites block

  // Tick a recipient and "Invite without a role" — the send itself is the human's action.
  await page.evaluate(() => {
    const cbs = window.__cb();
    const rec = cbs.find(x => /\(@/.test(x.lbl) && !/role/i.test(x.lbl));
    const nor = cbs.find(x => /Invite without a role/.test(x.lbl));
    for (const c of cbs) if (c.checked && c !== rec && c !== nor) { c.e.scrollIntoView({ block: 'center' }); c.e.click(); }
    if (rec && !rec.checked) { rec.e.scrollIntoView({ block: 'center' }); rec.e.click(); }
    if (nor && !nor.checked) { nor.e.scrollIntoView({ block: 'center' }); nor.e.click(); }
  });
  await page.waitForTimeout(1000);
  await page.evaluate(CB);

  out.asserted = await page.evaluate(() => {
    const main = document.querySelector('main');
    const send = [...main.querySelectorAll('button')].find(b => /Send direct invites/.test(b.innerText));
    const lines = main.innerText.split('\n').map(s => s.trim()).filter(Boolean);
    const i = lines.indexOf('RECIPIENT\tSTATUS\tROLES\tEXPIRES\tACTIONS');
    const history = i >= 0 ? lines.slice(i + 1, i + 12) : [];
    const caption = lines.find(l => /Email delivery may be delayed/.test(l)) || null;
    return {
      url: location.href,
      onInvites: /\/settings\/admin\/invites$/.test(location.pathname),
      checkboxes: window.__cb().map(x => x.lbl + '=' + x.checked),
      sendEnabled: !!send && !send.disabled,
      captionUnderForm: caption,
      historyRowsNow: history.filter(l => /\(@/.test(l)).slice(0, 4),
      historyHasNamedRoleRow: history.some(l => /\(@/.test(l) && /\t(Member|Admin|Guest)\b/.test(l)),
    };
  });

  const a = out.asserted;
  const recipientTicked = a.checkboxes.some(c => /\(@.*=true$/.test(c));
  const noRoleTicked = a.checkboxes.some(c => /^Invite without a role=true$/.test(c));
  if (!a.onInvites || !recipientTicked || !noRoleTicked || !a.sendEnabled) {
    out.leftToDo = 'Setup did not reach the state this finding needs — a recipient and "Invite without '
                 + 'a role" are not both ticked with Send direct invites enabled. Do not judge this '
                 + 'screen; re-run, or tick them by hand.';
    return out;
  }

  out.ready = true;
  out.stepsDone = 1;   // step 2 (press Send direct invites) is the human's
  out.leftToDo = 'A recipient and the "Invite without a role" checkbox are ticked and Send direct '
               + 'invites is enabled. Press "Send direct invites", then read the new top row of '
               + '"Direct invite history" — its ROLES column. For the comparison in step 4, rows sent '
               + 'with a real role are already in the same table (they read Member / Admin / Guest). '
               + 'Press "Revoke invite" on the row you created to leave the workspace as you found it.';
  return out;
};
