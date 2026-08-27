export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/invites`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  return await page.evaluate(() => {
    const main=document.querySelector('main');
    const t=(main.innerText||'').replace(/\s+/g,' ');
    const q=['Email delivery may be delayed','in-app inbox','Create direct invites'];
    const found={};
    for(const s of q){ const i=t.indexOf(s); found[s]= i>=0 ? t.slice(Math.max(0,i-40), i+120) : '(absent)'; }
    return found;
  });
};
