/* Repro: the workspace invite permission opens a page whose every control is disabled.
 * Report: lane D, "[FE-WEB][ADMIN] Право приглашать в workspace открывает страницу, на которой неактивны все элементы управления"
 *
 * Drives the COMPANY OWNER: only the owner can create the role and assign it. The screen
 * the finding is about belongs to the recipient, so the last thing the human does is move
 * to the other browser. Re-running deletes the role this kit created last time, so the
 * recipient always ends up holding exactly the fixture Member role plus this one grant.
 */
import { grantSinglePermission, livePermissions, CO, WS, RECIPIENT } from './d-rolekit.mjs';

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/company`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2800);

  const grant = await grantSinglePermission(page, { scope: 'workspace', label: 'invite', permission: `workspace.${WS}.invite` });
  progress(1);   // step 1: a role with that single permission exists
  const perms = await livePermissions(page);
  progress(2);   // step 2: it is assigned to a member with no company-admin rights

  out.asserted = {
    url: page.url(),
    grantedRole: grant.roleName,
    createStatus: grant.createStatus,
    assignStatus: grant.assignStatus,
    deletedFromEarlierRuns: grant.cleaned,
    recipient: RECIPIENT.name,
    // live permissions of the acting account, read at the moment of measurement —
    // a role is mutable state that earlier testing changes
    recipientCompanyRoles: perms.company,
    recipientWorkspaceRoles: perms.workspace,
  };

  const flat = JSON.stringify(perms);
  if (!grant.ok || !flat.includes('.invite')) {
    out.leftToDo = 'Setup did not reach the state this finding needs — the single-permission role was '
                 + 'not created and assigned. Do not judge anything; re-run, or build the role by hand '
                 + 'in Settings → Roles.';
    return out;
  }

  out.ready = true;
  out.stepsDone = 2;   // step 3 (be that member) is the human's
  out.leftToDo = 'QA Carol now holds exactly one grant beyond the fixture Member role: the workspace invite '
               + 'permission (quoted in asserted). Switch to the OTHER browser — the one signed in as '
               + 'QA Carol — reload it, and open Settings → Admin → Invites. Try to create an invite '
               + 'link, and try the direct invite form below it, including the "Invite without a role" '
               + 'checkbox. Then press Revoke invite on any row of the Invite links table and watch what '
               + 'happens. Run this snippet again, or any of the other three lane-D '
               + 'permission snippets, and this grant is removed — each of the four leaves the recipient '
               + 'holding exactly one permission beyond the fixture Member role.';
  return out;
};
