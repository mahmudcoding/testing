export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/members', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  return await page.evaluate(async () => {
    const W='W4QDF1XTURESO01';
    const out = {};
    const r = await fetch(`/api/v1/workspaces/${W}/members?limit=50`, { credentials:'include' });
    const j = await r.json(); const arr = j.members||j.items||j||[];
    out.workspaceMembers = arr.map(m => ({ name:m.name, is_guest:m.is_guest, roles:(m.roles||[]).map(x=>x.name+'/'+(x.scope_type||'?')) }));
    // company-scope member list, which the admin page is more likely to use
    const co = await fetch(`/api/v1/companies/O4QDF1XTURESO01/admin/members?limit=50`, { credentials:'include' });
    let cj = null; try { cj = await co.json(); } catch {}
    const carr = cj ? (cj.members||cj.items||cj||[]) : [];
    out.companyMembersStatus = co.status;
    out.companyMembers = Array.isArray(carr) ? carr.map(m => ({ name:m.name, is_guest:m.is_guest, roles:(m.roles||[]).map(x=>x.name) })).slice(0,10) : String(carr).slice(0,120);
    return out;
  });
};
