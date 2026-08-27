export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/invites', { waitUntil:'networkidle' });
  await page.waitForTimeout(2500);
  return await page.evaluate(async () => {
    const W='W4QDF1XTURESO01';
    const j = await (await fetch(`/api/v1/workspaces/${W}/invites`, { credentials:'include' })).json();
    const a = j.invites||j.items||[];
    return a.filter(i=>i.status==='pending').map(i=>({ id:i.id, created:i.created_at, expires:i.expires_at,
      uses:`${i.used_count}/${i.max_uses}`, roles:(i.role_ids||[]).length }));
  });
};
