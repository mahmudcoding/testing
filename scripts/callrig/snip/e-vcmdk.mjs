const WS = 'W4QEF1XTURESO01';
export default async ({ page }) => {
  const out = [];
  for (const route of [`/w/${WS}/directories`, `/w/${WS}/c/C4QEGENERAL0001`]) {
    await page.goto('https://airion-cargo.store' + route, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4500);
    await page.keyboard.press('Meta+K');
    await page.waitForTimeout(1500);
    const r = await page.evaluate(() => {
      const vis = (el) => { const b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0; };
      const d = [...document.querySelectorAll('[role="dialog"]')].filter(vis)[0];
      const t = d ? (d.innerText || '').replace(/\s+/g, ' ').trim() : null;
      return { dialog: !!d, isGlobalSearch: !!t && /Global search/.test(t), head: t ? t.slice(0, 70) : null,
               active: (document.activeElement?.getAttribute('aria-label') || document.activeElement?.tagName || '') };
    });
    out.push({ route, ...r });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(600);
  }
  return out;
};
