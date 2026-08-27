export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/roles?scope=workspace`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  return await page.evaluate(() => {
    const main=document.querySelector('main')||document.body;
    const all=(main.innerText||'').replace(/\s+/g,' ');
    const i=all.indexOf('Company roles Workspace roles');
    return { msg: (i>=0? all.slice(i): all).slice(0,320) };
  });
};
