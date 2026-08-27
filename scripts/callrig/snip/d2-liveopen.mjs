export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/members`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  return await page.evaluate(() => {
    const main=document.querySelector('main');
    const t=(main.innerText||'').replace(/\s+/g,' ');
    const i=t.indexOf('MEMBER');
    return { rowsRegion: i>=0? t.slice(i,i+300):t.slice(0,300),
             mentionsProbe: /LiveProbe/.test(t) };
  });
};
