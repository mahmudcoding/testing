export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/workspaces`, { waitUntil:'networkidle' });
  await page.waitForTimeout(1800);
  return await page.evaluate(`(async()=>{
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const r=await fetch('/api/v1/workspaces/W4QDF1XTURESO01/storage',{credentials:'include'});
    const t=await r.text();
    const u=await fetch('/api/v1/users/me/storage',{credentials:'include'});
    return { who:me.email.split('@')[0], status:r.status, body:t.slice(0,180), userScopedStatus:u.status };})()`);
};
