export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/invites', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  return await page.evaluate(async () => {
    const W='W4QDF1XTURESO01';
    const call = async (m,u,b) => { const r = await fetch(u, { method:m, credentials:'include',
      headers: b?{'Content-Type':'application/json'}:{}, body: b?JSON.stringify(b):undefined });
      const t = await r.text(); let j=null; try{j=JSON.parse(t);}catch{}; return { s:r.status, j, raw:t.slice(0,200) }; };
    const out = {};
    out.createInvite = await call('POST', '/api/v1/workspaces/invites',
      { workspace_id: W, role_ids: [], max_uses: 1, expires_in_days: 1 });
    const id = out.createInvite.j && (out.createInvite.j.id || (out.createInvite.j.invite||{}).id);
    out.inviteId = id ? '(created)' : '(no id in response)';
    if (id) out.revoke = await call('POST', `/api/v1/workspaces/invites/${id}/revoke`, {});
    if (id && out.revoke.s >= 400) out.revokeAlt = await call('DELETE', `/api/v1/workspaces/invites/${id}`);
    return out;
  });
};
