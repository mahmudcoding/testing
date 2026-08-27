export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/directories?tab=people', { waitUntil:'networkidle' });
  await page.waitForTimeout(2500);
  return await page.evaluate(async () => {
    const j=await (await fetch('/api/v1/workspaces/W4QDF1XTURESO01/members?limit=50',{credentials:'include'})).json();
    const a=j.members||j.items||[];
    const alice=a.find(m=>m.user_id==='U4QDALICE000001')||{};
    const owner=a.find(m=>m.user_id==='U4QDOWNER000001')||{};
    return { aliceKeys: Object.keys(alice), aliceTimezone: alice.timezone ?? '(field absent)',
             ownerTimezone: owner.timezone ?? '(field absent)' };
  });
};
