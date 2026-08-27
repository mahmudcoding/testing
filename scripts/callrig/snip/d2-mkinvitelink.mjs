export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/invites', { waitUntil:'networkidle' });
  await page.waitForTimeout(2500);
  return await page.evaluate(async () => {
    const W='W4QDF1XTURESO01';
    const wr = await fetch(`/api/v1/workspaces/${W}/roles`, { credentials:'include' });
    const wj = await wr.json(); const warr = Array.isArray(wj)?wj:(wj.roles||[]);
    const member = warr.find(r=>r.name==='Member');
    const r = await fetch('/api/v1/workspaces/invites', { method:'POST', credentials:'include',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ workspace_id: W, role_ids:[member.id], max_uses: 2, expires_in_days: 1 }) });
    const j = await r.json();
    return { status:r.status, id:j.id, roleGranted: member.name,
             link: `https://airion-cargo.store/invite?token=${encodeURIComponent(j.token)}` };
  });
};
