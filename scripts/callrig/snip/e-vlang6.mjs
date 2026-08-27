const WS = 'W4QEF1XTURESO01';
export default async ({ page }) => {
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.locator('button[aria-label="Language"], button[aria-label="Язык"]').first().click();
  await page.waitForTimeout(1500);
  const btns = await page.$$('button');
  const list = [];
  for (let i = 0; i < btns.length; i++) {
    const info = await btns[i].evaluate(el => {
      const r = el.getBoundingClientRect();
      return { vis: r.width > 0 && r.height > 0, txt: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 26), al: el.getAttribute('aria-label') };
    });
    if (info.vis && info.txt) list.push({ i, ...info });
  }
  const target = list.find(x => /^English$/i.test(x.txt));
  if (target) { await btns[target.i].click(); await page.waitForTimeout(2600); }
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  const after = await page.evaluate(() => {
    const b = document.querySelector('button[aria-label^="Notifications"], button[aria-label^="Уведомл"]');
    const lb = document.querySelector('button[aria-label="Language"], button[aria-label="Язык"]');
    return { bell: b ? b.getAttribute('aria-label') : null, lang: lb ? (lb.innerText || '').trim() : null };
  });
  return { candidates: list.filter(x => /english|рус|uzb|oʻz|o'z/i.test(x.txt)).slice(0, 8), clicked: target ? target.txt : null, after };
};
