export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/profile', { waitUntil:'networkidle' });
  await page.waitForTimeout(2400);
  return await page.evaluate(async () => {
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const W='W4QDF1XTURESO01';
    const m=await (await fetch(`/api/v1/workspaces/${W}/members`,{credentials:'include'})).json();
    const arr=m.members||m.items||[];
    return { authMeName:me.name,
             memberRowName:(arr.find(x=>x.user_id==='U4QDALICE000001')||{}).name,
             allNames:arr.map(x=>x.name).sort() };
  });
};
