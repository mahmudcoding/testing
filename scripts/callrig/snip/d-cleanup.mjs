/* Lane D helper: delete every role this session's repro kit created, and its assignments.
 * Run from the company owner's browser. */
import { cleanup, listRoles, livePermissions } from './d-rolekit.mjs';
const WS = 'W4QDF1XTURESO01';
export default async ({ page }) => {
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/company`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2600);
  const removed = await cleanup(page);
  return {
    removed,
    companyRolesLeft: (await listRoles(page, 'company')).map(r => r.name),
    workspaceRolesLeft: (await listRoles(page, 'workspace')).map(r => r.name),
    recipientPermissionsNow: await livePermissions(page),
  };
};
