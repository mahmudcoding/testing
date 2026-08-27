/* Lane D helper: revoke every pending direct invite in the lane D workspace, through the UI. */
const WS = 'W4QDF1XTURESO01';
export default async ({ page }) => {
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/invites`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  let clicks = 0;
  for (let i = 0; i < 6; i++) {
    const did = await page.evaluate(() => {
      const b = [...document.querySelectorAll('main button')].find(x => /^Revoke invite$/.test(x.innerText.trim()) && !x.disabled);
      if (!b) return false;
      b.scrollIntoView({ block: 'center' }); b.click(); return true;
    });
    if (!did) break;
    clicks++;
    await page.waitForTimeout(2200);
  }
  const pending = await page.evaluate(async (ws) => {
    const r = await fetch(`/api/v1/workspaces/${ws}/invites/direct`, { credentials: 'include' });
    const j = await r.json();
    return (j.invites || []).filter(i => i.status === 'pending').length;
  }, WS);
  return { clicks, pendingLeft: pending };
};
