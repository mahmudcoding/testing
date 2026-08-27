/* Repro: the storage block is titled "My storage in this workspace" while its own last
 * line says the storage is shared by everyone in the workspace.
 * Report: lane D, "[FE-WEB][ADMIN] Блок хранилища подписан «My storage», хотя строкой
 * ниже сказано, что хранилище общее" */
const WS = 'W4QDF1XTURESO01', CO = 'O4QDF1XTURESO01';

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/workspaces`,
                  { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  out.asserted = await page.evaluate(async ([ws, co]) => {
    const main = document.querySelector('main') || document.body;
    const btn = [...main.querySelectorAll('button')].find(b => /Show storage/i.test(b.innerText));
    // live permissions of the acting account, read at the moment of measurement
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
      onWorkspacesAdmin: /\/settings\/admin\/workspaces$/.test(location.pathname),
      blockTitleVisible: main.innerText.includes('My storage in this workspace'),
      showStorageButton: !!btn && !btn.disabled,
      storageCollapsed: !main.innerText.includes('Storage is shared by everyone'),
      actingAccount: me,
      actingCompanyRoles: roles,
    };
  }, [WS, CO]);

  if (!out.asserted.onWorkspacesAdmin || !out.asserted.showStorageButton
      || !out.asserted.blockTitleVisible) {
    out.leftToDo = 'Setup did not reach the state this finding needs — Settings → Admin → Workspaces '
                 + 'is not showing the workspace card with a Show storage button. Do not judge this '
                 + 'screen; re-run, or open it by hand with an account that administers the company.';
    return out;
  }
  progress(1);   // step 1: on Settings → Admin → Workspaces

  out.ready = true;
  out.stepsDone = 1;   // step 2 (press Show storage) is the human's
  out.leftToDo = 'Press "Show storage" on the workspace card, then read the block top to bottom: '
               + 'the title says "My storage in this workspace" and the last line of the same block '
               + 'says "Storage is shared by everyone in this workspace."';
  return out;
};
