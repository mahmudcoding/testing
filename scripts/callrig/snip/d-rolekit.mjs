/* Lane D only — shared setup for the four permission findings.
 *
 * Not a repro snippet: it is imported by d-invite-perm.mjs, d-audit-perm.mjs,
 * d-roles-perm.mjs and d-kick-owner.mjs. It is a new file rather than an edit to any
 * shared helper, and it is used by lane D alone.
 *
 * Everything here runs from the COMPANY OWNER's browser: the owner may create roles,
 * assign them and read the member roster, so one page can both build the state and
 * quote the recipient's live permissions at the moment of measurement.
 */
export const CO = 'O4QDF1XTURESO01';
export const WS = 'W4QDF1XTURESO01';
export const RECIPIENT = { id: 'U4QDCAROL000001', name: 'QA Carol' };

/** Roles this kit creates all carry this prefix, so a re-run can clear its own litter. */
export const PREFIX = 'QA repro D — ';

const api = (page, method, path, body) => page.evaluate(async ([m, p, b]) => {
  const r = await fetch(p, {
    method: m, credentials: 'include',
    headers: b ? { 'content-type': 'application/json' } : undefined,
    body: b ? JSON.stringify(b) : undefined,
  });
  const t = await r.text();
  let j = null; try { j = JSON.parse(t); } catch {}
  return { status: r.status, json: j, text: t.slice(0, 300) };
}, [method, path, body ?? null]);

/** Every role at one scope, whatever its name. */
export const listRoles = async (page, scope) => {
  const path = scope === 'company' ? `/api/v1/companies/${CO}/roles` : `/api/v1/workspaces/${WS}/roles`;
  const r = await api(page, 'GET', path);
  return r.status === 200 ? (r.json.roles || r.json || []) : [];
};

/** Remove every role this kit has ever created at either scope, and its assignments. */
export const cleanup = async (page) => {
  const removed = [];
  for (const scope of ['company', 'workspace']) {
    for (const role of await listRoles(page, scope)) {
      if (!String(role.name || '').startsWith(PREFIX)) continue;
      const revokePath = scope === 'company'
        ? '/api/v1/companies/roles/revoke' : `/api/v1/workspaces/${WS}/roles/revoke`;
      await api(page, 'POST', revokePath, { user_id: RECIPIENT.id, role_id: role.id });
      const del = await api(page, 'DELETE', `/api/v1/companies/roles/${role.id}`);
      removed.push(`${role.name} (${del.status})`);
    }
  }
  return removed;
};

/**
 * Create a single-permission role at `scope` and assign it to the recipient.
 * Clears the kit's earlier roles first, so the recipient ends up holding exactly
 * the fixture Member role plus this one.
 */
export const grantSinglePermission = async (page, { scope, label, permission }) => {
  const cleaned = await cleanup(page);
  const name = PREFIX + label;
  const createPath = scope === 'company' ? `/api/v1/companies/${CO}/roles` : `/api/v1/workspaces/${WS}/roles`;
  const created = await api(page, 'POST', createPath, { name, permissions: [permission] });
  if (created.status !== 200 && created.status !== 201) return { ok: false, step: 'create', created, cleaned };
  const roleId = created.json && created.json.id;
  const assignPath = scope === 'company' ? '/api/v1/companies/roles/assign' : `/api/v1/workspaces/${WS}/roles/assign`;
  const assigned = await api(page, 'POST', assignPath, { user_id: RECIPIENT.id, role_id: roleId });
  return { ok: assigned.status === 200 || assigned.status === 201,
           roleId, roleName: name, cleaned, createStatus: created.status, assignStatus: assigned.status };
};

/**
 * The recipient's live permissions, read at the moment of measurement from the
 * rosters — there is no `my-permissions` endpoint on this build (every candidate
 * answers 404), and a role is mutable state earlier testing changes.
 */
export const livePermissions = async (page) => {
  const out = { company: null, workspace: null };
  for (const [key, path] of [['company', `/api/v1/companies/${CO}/members`],
                             ['workspace', `/api/v1/workspaces/${WS}/members`]]) {
    const r = await api(page, 'GET', path);
    if (r.status !== 200) { out[key] = `HTTP ${r.status}`; continue; }
    const me = (r.json.members || []).find((m) => m.user_id === RECIPIENT.id);
    out[key] = me ? me.roles.map((x) => `${x.name}: ${x.permissions.join(' ')}`) : 'not a member';
  }
  return out;
};
