/* Repro: the audit log prints machine event keys in ACTION and raw JSON in METADATA.
 * Report: lane D, "[FE-WEB][ADMIN] Журнал аудита выводит служебные ключи событий и
 * сырой JSON вместо описания произошедшего" */
const WS = 'W4QDF1XTURESO01', CO = 'O4QDF1XTURESO01';

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/audit-log`,
                  { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  out.asserted = await page.evaluate(async (co) => {
    const main = document.querySelector('main') || document.body;
    const rows = [...main.querySelectorAll('tbody tr')];
    const cell = (tr, n) => tr.querySelectorAll('td')[n]?.innerText.trim() ?? '';
    const actions = rows.map(r => cell(r, 0)).filter(Boolean);
    const meta = rows.map(r => cell(r, 4)).filter(Boolean);
    const headers = [...main.querySelectorAll('thead th')].map(t => t.innerText.trim());
    let me = null, roles = null;
    try {
      const j = await (await fetch('/api/v1/auth/me', { credentials: 'include' })).json();
      me = (j.data || j).id;
      const m = await (await fetch(`/api/v1/companies/${co}/members`, { credentials: 'include' })).json();
      const mine = (m.members || []).find(x => x.user_id === me);
      roles = mine ? mine.roles.map(r => `${r.name}:${r.permissions.join('|')}`) : null;
    } catch {}
    return {
      url: location.href,
      onAuditLog: /\/settings\/admin\/audit-log$/.test(location.pathname),
      headers,
      rowCount: rows.length,
      distinctActions: [...new Set(actions)],
      dottedKeyActions: [...new Set(actions)].filter(a => /^[a-z_]+\.[a-z_]+$/.test(a)),
      firstMetadata: meta[0] ? meta[0].slice(0, 220) : null,
      metadataLooksLikeJson: meta.filter(m => m.trim().startsWith('{')).length,
      actingAccount: me,
      actingCompanyRoles: roles,
    };
  }, CO);

  const a = out.asserted;
  if (!a.onAuditLog || a.rowCount === 0 || a.dottedKeyActions.length === 0) {
    out.leftToDo = 'Setup did not reach the state this finding needs — the audit log did not render '
                 + 'rows with event keys in ACTION. Do not judge this screen; re-run, or open '
                 + 'Settings → Admin → Audit log by hand with an account that administers the company.';
    return out;
  }
  progress(1);   // step 1: on the audit log with rows loaded

  out.ready = true;
  out.stepsDone = 1;   // step 2 (read the ACTION and METADATA columns) is the human's
  out.leftToDo = 'Read the ACTION and METADATA columns of the table on screen. ACTION holds the raw '
               + 'event keys (' + a.dottedKeyActions.slice(0, 4).join(', ') + ' …), METADATA holds raw '
               + 'JSON with internal ids and permission strings, while the column headers and the '
               + 'CREATED column are formatted and translated. Optionally then switch the interface '
               + 'language in Settings → Account → Language and reload — the same strings come back.';
  return out;
};
