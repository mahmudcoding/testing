const WS = 'W4QEF1XTURESO01';
export default async ({ page }) => {
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  const trig = page.locator('button[aria-label="Язык"], button[aria-label="Language"]').first();
  await trig.click();
  await page.waitForTimeout(2000);
  return await page.evaluate(() => {
    const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const all = [...document.querySelectorAll('button,[role=option],[role=menuitem],li,option')].filter(vis)
      .map(b => ({ tag: b.tagName, role: b.getAttribute('role'), txt: (b.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 24) }))
      .filter(x => x.txt);
    return { count: all.length, all: all.slice(0, 40), expanded: document.querySelector('button[aria-label="Язык"]')?.getAttribute('aria-expanded') };
  });
};
