/* Repro: the direct-invite caption promises the invitation is also in the recipient's in-app
 * inbox; the recipient's PENDING INVITES section carries no action at all.
 * Report: lane D, "[FE-WEB][ADMIN] Подпись обещает, что приглашение можно принять в
 * приложении — принять его там нельзя" */
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

  // Is there already a pending direct invite? Do not pile up duplicates across runs.
  const pendingBefore = await page.evaluate(async (ws) => {
    const r = await fetch(`/api/v1/workspaces/${ws}/invites/direct`, { credentials: 'include' });
    const j = await r.json();
    return (j.invites || []).filter(i => i.status === 'pending')
      .map(i => ({ id: i.id, recipient: i.recipient_user_id, expires: i.expires_at }));
  }, WS);

  let recipientLabel = null;
  if (!pendingBefore.length) {
    await page.evaluate(CB);
    recipientLabel = await page.evaluate(() => {
      const cbs = window.__cb();
      const rec = cbs.find(x => /\(@/.test(x.lbl) && !/role/i.test(x.lbl));
      const role = cbs.find(x => /Workspace role/.test(x.lbl)) || cbs.find(x => /Invite without a role/.test(x.lbl));
      if (!rec) return null;
      if (!rec.checked) { rec.e.scrollIntoView({ block: 'center' }); rec.e.click(); }
      if (role && !role.checked) { role.e.scrollIntoView({ block: 'center' }); role.e.click(); }
      return rec.lbl;
    });
    await page.waitForTimeout(900);
    await page.evaluate(() => {
      const b = [...document.querySelectorAll('main button')].find(x => /Send direct invites/.test(x.innerText));
      b && !b.disabled && b.click();
    });
    await page.waitForTimeout(3500);
  }
  progress(1);   // step 1: a direct invite to a company member outside the workspace is pending

  out.asserted = await page.evaluate(async (ws) => {
    const main = document.querySelector('main');
    const lines = main.innerText.split('\n').map(s => s.trim()).filter(Boolean);
    const r = await fetch(`/api/v1/workspaces/${ws}/invites/direct`, { credentials: 'include' });
    const j = await r.json();
    const pending = (j.invites || []).filter(i => i.status === 'pending');
    return {
      url: location.href,
      onInvites: /\/settings\/admin\/invites$/.test(location.pathname),
      captionUnderForm: lines.find(l => /Email delivery may be delayed/.test(l)) || null,
      pendingCount: pending.length,
      pendingRecipients: pending.map(p => p.recipient_user_id),
      pendingExpires: pending.map(p => p.expires_at),
      historyTopRow: (() => {
        const i = lines.indexOf('RECIPIENT\tSTATUS\tROLES\tEXPIRES\tACTIONS');
        return i >= 0 ? (lines.slice(i + 1).find(l => /\(@/.test(l)) || null) : null;
      })(),
    };
  }, WS);
  out.asserted.sentThisRun = recipientLabel;

  const a = out.asserted;
  if (!a.onInvites || a.pendingCount === 0 || !/in-app inbox/i.test(a.captionUnderForm || '')) {
    out.leftToDo = 'Setup did not reach the state this finding needs — no pending direct invite, or the '
                 + 'caption under the form is not the one the finding quotes. Do not judge this; re-run, '
                 + 'or send a direct invite by hand from Settings → Admin → Invites.';
    return out;
  }

  out.ready = true;
  out.stepsDone = 1;   // step 2 (look at it as the recipient) is the human's
  out.leftToDo = 'A direct invite is pending, and the caption under this form reads: "'
               + a.captionUnderForm + '". Now switch to the OTHER browser — the recipient, the company '
               + 'member who is not in this workspace — and click the round workspace button at the very '
               + 'top left of the rail (aria-label "Open workspace menu. Pending workspace invites: 1"). '
               + 'Read the PENDING INVITES section and try to find anything there to press. '
               + 'Revoke the invite from this screen afterwards to leave the workspace as you found it.';
  return out;
};
