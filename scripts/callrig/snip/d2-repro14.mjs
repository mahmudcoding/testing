export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  const api = await page.evaluate(async (WS) => {
    const r=await fetch(`/api/v1/workspaces/${WS}/invites`,{credentials:'include'});
    const p=await r.json();
    return (p.invites||[]).slice(0,3).map(i=>({id:i.id, role_ids:i.role_ids, hasRoleField:'role_ids' in i, status:i.status}));
  }, WS);
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/invites`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const ui = await page.evaluate(() => {
    const main=document.querySelector('main');
    const t=(main.innerText||'').replace(/\s+/g,' ');
    const i=t.indexOf('Invite links');
    return { rowsText: i>=0? t.slice(i, i+220):'(no table)',
      roleUnavailableCount: (t.match(/Role unavailable/g)||[]).length };
  });
  return { api, ui };
};
