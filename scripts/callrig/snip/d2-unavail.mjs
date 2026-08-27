export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=workspace', { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  return await page.evaluate(() => {
    const t=(document.querySelector('main')||document.body).innerText;
    const i=t.indexOf('Managing roles');
    return { block: (i>=0?t.slice(i):t).replace(/\n+/g,' | ').slice(0,420) };
  });
};
