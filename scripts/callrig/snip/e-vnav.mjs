const WS = 'W4QEF1XTURESO01';
export default async ({ page }) => {
  await page.goto(`https://airion-cargo.store/w/${WS}/c/C4QEGENERAL0001`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);
  await page.keyboard.press('Escape');
  return await page.evaluate(() => {
    const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const btns = [...document.querySelectorAll('button,a[href]')].filter(vis).map(b => ({
      t: (b.getAttribute('aria-label') || b.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40),
      tid: b.getAttribute('data-testid') || null,
    })).filter(x => x.t || x.tid);
    const search = btns.filter(b => /search|find|поиск/i.test(b.t + ' ' + (b.tid || '')));
    return { total: btns.length, searchish: search.slice(0, 12), first25: btns.slice(0, 25) };
  });
};
